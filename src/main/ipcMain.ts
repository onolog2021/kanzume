import { ipcMain } from 'electron';
import path, { resolve } from 'path';
import { IpcMainEvent } from 'electron/main';
import { table } from 'console';
import { type } from 'os';
import sqlite3 from '../../release/app/node_modules/sqlite3';

const dbPath = path.resolve(__dirname, '../../editor.db');
const db = new sqlite3.Database(dbPath);

function createPlaceholder(length: number) {
  const placeholders = Array(length).fill('?').join(', ');
  return `(${placeholders})`;
}

function formatObjectKeyValuePairs(obj) {
  const keyValuePairs = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      keyValuePairs.push(`${key} = ${obj[key]}`);
    }
  }

  return keyValuePairs.join(', ');
}

ipcMain.handle('getTableData', (_e, table_name) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${table_name}`;
    db.all(sql, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('findById', (_e, ary) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${ary[0]} WHERE id = (?)`;
    db.get(sql, [parseInt(ary[1])], (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(row);
      }
    });
  });
});

ipcMain.on('deleteById', (_e, ary) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM ${ary[0]} WHERE id = (?)`;
    db.get(sql, [parseInt(ary[1])], (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(row);
      }
    });
  });
});

ipcMain.handle('savePage', (_e, map) => {
  return new Promise((resolve, reject) => {
    if (!map.get('title')) {
      map.set('title', '無題');
    }
    const sql =
      'INSERT OR REPLACE INTO page(id, title, project_id, content, position) VALUES(?, ?, ?, ?, ?)';
    const value = [
      map.get('page_id'),
      map.get('title'),
      map.get('project_id'),
      map.get('content'),
      map.get('position'),
    ];
    const page_id = map.get('page_id');
    db.run(sql, value, function (error) {
      if (error) {
        reject(error);
      } else if (page_id) {
        resolve(page_id);
      } else {
        resolve(this.lastID);
      }
    });
  });
});

ipcMain.on('saveTextData', (_e, ary) => {
  const sql = 'UPDATE page SET content = ? WHERE id = ?';
  db.run(sql, ary, (error) => {
    if (error) {
      console.error(error);
    }
  });
});

ipcMain.handle('fetchRecords', (event, args) => {
  const { columns, table, conditions, order, limit } = args;
  return new Promise((resolve, reject) => {
    let query;
    if (columns) {
      query = `SELECT ${columns.join(', ')} FROM ${table}`;
    } else {
      query = `SELECT * FROM ${table}`;
    }

    if (conditions && Object.keys(conditions).length > 0) {
      const conditionArray = [];
      for (const key in conditions) {
        conditionArray.push(`${key} = ?`);
      }
      query += ` WHERE ${conditionArray.join(' AND ')}`;
    }

    if (order) {
      query += ` ORDER BY ${order[0]} ${order[1]}`;
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    console.log(query);

    db.all(query, Object.values(conditions || {}), (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
});

ipcMain.on('changePageTitle', (_e, ary) => {
  const sql = 'UPDATE page SET title = ? WHERE id = ?';
  const value = [ary[1], ary[0]];
  db.run(sql, value, (error) => {
    if (error) {
      console.error(error);
    }
  });
});

ipcMain.handle('findChildPage', (_e, folderId) => {
  const sql =
    'SELECT p.title, p.id FROM page p INNER JOIN folder f ON f.id = p.folder_id WHERE f.id = ?';
  const value = [folderId];
  return executeDbAll(sql, value);
});

ipcMain.on('bookmarking', (_e, ary) => {
  const sql = ary[2]
    ? 'INSERT OR REPLACE INTO bookmark(target, target_id) VALUES (?, ?)'
    : 'DELETE bookmark WHERE target = ? AND target_id = ?';
  const value = [ary[0], ary[1]];
  executeDbRun(sql, value);
});

ipcMain.handle('getPages', async (_e, projectId) => {
  const sql =
    'SELECT id, title, position, folder_id from page WHERE project_id = ? ORDER BY position ASC';
  return executeDbAll(sql, projectId);
});

ipcMain.handle('getFolders', (_e, projectId) => {
  const sql =
    "SELECT id, title, position, parent_id from folder WHERE project_id = ? AND type = 'folder' ORDER BY position ASC";
  return executeDbAll(sql, projectId);
});

ipcMain.handle('getStores', (_e, projectId) => {
  const sql =
    'SELECT s.folder_id, s.page_id, s.position from store s JOIN page p ON p.id = s.page_id WHERE p.project_id = ? ORDER BY s.position ASC';
  return executeDbAll(sql, projectId);
});

ipcMain.handle('getBoards', (_e, projectId) => {
  const sql =
    "SELECT id, title, position, parent_id from folder WHERE project_id = ? AND type = 'board' ORDER BY position ASC";
  return executeDbAll(sql, projectId);
});

ipcMain.handle('boardChildren', (_e, folderId) => {
  const sql =
    'SELECT p.id, p.title, p.content FROM page p JOIN store s ON s.page_id = p.id JOIN folder f ON f.id = s.folder_id WHERE f.id = ? ORDER BY s.position ASC';
  return executeDbAll(sql, folderId);
});

ipcMain.on('updatePageList', (event, projectId) => {
  updatePageList(projectId, event);
});

// table,position,id,type
ipcMain.on('updatePosition', (event, args) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    args.values?.forEach((element) => {
      const columns = element.type
        ? `position = ${element.position}, type = '${element.type}'`
        : `position = ${element.position}`;
      const sqlLine = `UPDATE ${element.table} SET ${columns} WHERE id = ${element.id};`;
      db.run(sqlLine, (error) => {
        if (error) {
          console.error(error);
        }
      });
    });
    db.run('COMMIT;');
  });
  // ここあとで調節
  updatePageList(args.projectId, event);
});

ipcMain.on('destroyStore', (event, arg) => {
  const sql = 'DELETE FROM store WHERE page_id = ? AND folder_id = ?';
  const value = [arg.page_id, arg.folder_id];
  executeDbRun(sql, value);
});

ipcMain.on('updateBoardPapers', (event, array) => {
  // それぞれに更新した内容を送信する。
  array.forEach((boardId) => {
    getBoardBody(event, boardId);
  });
});

ipcMain.on('updateBoardList', (event, projectId) => {
  event.reply('updateBoardList', projectId);
});

ipcMain.on('droppedBoardBody', (event, values) => {
  const array = values[1];
  const childrenFunc = () => {
    array?.forEach((element) => {
      if (element.id) {
        const valuesSet = formatObjectKeyValuePairs(element);
        const sqlLine = `UPDATE store SET ${valuesSet} WHERE id = ${element.id}`;
        db.run(sqlLine, (error) => {
          if (error) {
            console.error(error);
          }
        });
      } else {
        const columns = Object.keys(element);
        const values = Object.values(element);
        const placeholder = createPlaceholder(values.length);
        const sqlLine = `INSERT OR REPLACE INTO store(${columns}) VALUES ${placeholder};`;
        db.run(sqlLine, values, (error) => {
          if (error) {
            console.error(error);
          }
        });
      }
    });
  };

  const dropped = () => {
    transactionSql(childrenFunc)
      .then(() => {
        getBoardBody(event, values[0]);
      })
      .catch((error) => {
        console.error('Transaction failed:', error);
      });
  };

  dropped();
});

async function executeDbAll<T>(sql: string, values: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    db.all(sql, values, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

function executeDbRun<T>(sql: string, values: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    db.run(sql, values, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve('success');
      }
    });
  });
}

function transactionSql(children) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION;');
      children();
      db.run('COMMIT;', (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  });
}

function getBoardBody(event: IpcMainEvent, boardId: number) {
  const sql =
    'SELECT p.id, p.title, p.content FROM page p JOIN store s ON s.page_id = p.id JOIN folder f ON f.id = s.folder_id WHERE f.id = ? ORDER BY s.position ASC';
  db.all(sql, boardId, (error, rows) => {
    if (error) {
      console.log(error);
    } else {
      event.reply('updatePapers', [boardId, rows]);
    }
  });
}

async function updatePageList(projectId: number, event: IpcMainEvent) {
  const sql =
    'SELECT id, title, position, folder_id from page WHERE project_id = ? ORDER BY position ASC';
  const rows = await executeDbAll(sql, [projectId]);
  event.reply('updatePageList', rows);
}

ipcMain.on('createNewStore', (event, args) => {
  const columns = Object.keys(args);
  const values = Object.values(args);
  const placeholder = createPlaceholder(values.length);
  const sql = `INSERT OR REPLACE INTO store(${columns}) VALUES ${placeholder};`;
  executeDbRun(sql, values).then(() => {
    getBoardBody(event, args.folder_id);
  });
});

function createRecord(args) {
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO ${args.table}`;
    if (args.columns) {
      const keys = Object.keys(args.columns);
      const columns = keys.join(',');
      sql += `(${columns}) `;
      const placeholder = keys.map((key) => '?').join(',');
      sql += `VALUES (${placeholder})`;
    }
    const values = Object.values(args.columns)
    console.log(sql);
    console.log(values);
    db.run(sql, values, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

ipcMain.handle('insertRecord', async (event, args) => {
  const result = await createRecord(args);
  return result;
})
