import { ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { error } from 'console';
import sqlite3 from '../../release/app/node_modules/sqlite3';

const dbPath = path.resolve(__dirname, '../../editor.db');
const db = new sqlite3.Database(dbPath);

function executeTransaction(sql: string, value: Array<T>) {
  db.run(sql, value, (error) => {
    console.log(error);
  });
}

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

ipcMain.handle('createProject', (_e, title) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO project(title) VALUES (?)';
    if (!title) {
      title = '無題';
    }
    db.run(sql, [title], function (error: string) {
      if (error) {
        reject(error);
      } else {
        resolve(this.lastID);
      }
    });
  });
});

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

ipcMain.handle('getProjectItems', (_e, ary) => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM ${ary[0]} WHERE project_id = (?) ORDER BY position ASC`;
    db.all(sql, [ary[1]], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('createFolder', (_e, object) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO folder(title, position, project_id, type) VALUES (?, ?, ?, ?)';
    const value = [
      object.title,
      object.position,
      object.project_id,
      object.type,
    ];
    db.run(sql, value, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(this.lastID);
      }
    });
  });
});

ipcMain.handle('getFolderChild', (_e, ary) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT p.id, p.title FROM page p JOIN store s ON p.id = s.page_id WHERE s.folder_id = (?);';
    db.all(sql, [ary[0]], (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.on('updatePageListPosition', (_e, object) => {
  object.forEach((element) => {
    const ary = [element.position, element.id];
    const sql = 'UPDATE page SET position = ? WHERE id = ?';
    db.run(sql, ary, (error) => {
      if (error) {
        console.error(error);
      }
    });
  });
});

ipcMain.on('updateBoardPosition', (_e, object) => {
  object.forEach((element) => {
    const ary = [element.position, element.id];
    const sql = 'UPDATE folder SET position = ? WHERE id = ?';
    db.run(sql, ary, (error) => {
      if (error) {
        console.error(error);
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

ipcMain.handle('createNewPage', (_e, ary) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO page(project_id, title, content, position) VALUES (?, ?, ?, ?)';
    const values = [ary[0], ary[1], '{}', -1];
    db.run(sql, values, function (error) {
      if (error) {
        reject(error);
      } else {
        console.log('success!');
        resolve(this.lastID);
      }
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

ipcMain.handle('getAllItems', async (_e, projectId) => {
  try {
    const projectPromise = db.get(
      `SELECT * FROM project WHERE id = ?`,
      projectId
    );
    const pagesPromise = db.all(
      `SELECT * FROM page WHERE project_id = ?`,
      projectId
    );
    const foldersPromise = db.all(
      `SELECT * FROM folder WHERE project_id = ?`,
      projectId
    );
    const storesPromise = db.all(
      `SELECT store.* FROM store JOIN folder ON store.folder_id = folder.id WHERE folder.project_id = ?`,
      projectId
    );

    const [project, pages, folders, stores] = await Promise.all([
      projectPromise,
      pagesPromise,
      foldersPromise,
      storesPromise,
    ]);

    return { project, pages, folders, stores };
  } catch (error) {
    console.error('Database operation failed:', error);
    throw error; // or handle error as you prefer
  }
});

ipcMain.handle('findChildPage', (_e, folderId) => {
  const sql =
    'SELECT p.title, p.id FROM page p INNER JOIN folder f ON f.id = p.folder_id WHERE f.id = ?';
  return new Promise((resolve, reject) => {
    db.all(sql, folderId, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.on('bookmarking', (_e, ary) => {
  const sql = ary[2]
    ? 'INSERT OR REPLACE INTO bookmark(target, target_id) VALUES (?, ?)'
    : 'DELETE bookmark WHERE target = ? AND target_id = ?';
  const value = [ary[0], ary[1]];
  db.run(sql, value, (error) => {
    console.log(error);
  });
});

async function getPages(projectId) {
  const sql =
    'SELECT id, title, position, folder_id from page WHERE project_id = ? ORDER BY position ASC';
  return new Promise((resolve, reject) => {
    db.all(sql, projectId, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
}

ipcMain.handle('getPages', async (_e, projectId) => {
  try {
    // getPageDataをawaitキーワードを使って非同期に待つ
    const rows = await getPages(projectId);
    return rows;
  } catch (error) {
    console.error(error);
    return [];
  }
});

ipcMain.handle('getFolders', (_e, projectId) => {
  const sql =
    "SELECT id, title, position, parent_id from folder WHERE project_id = ? AND type = 'folder' ORDER BY position ASC";
  return new Promise((resolve, reject) => {
    db.all(sql, projectId, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('getStores', (_e, projectId) => {
  const sql =
    'SELECT s.folder_id, s.page_id, s.position from store s JOIN page p ON p.id = s.page_id WHERE p.project_id = ? ORDER BY s.position ASC';
  return new Promise((resolve, reject) => {
    db.all(sql, projectId, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('getBoards', (_e, projectId) => {
  const sql =
    "SELECT id, title, position, parent_id from folder WHERE project_id = ? AND type = 'board' ORDER BY position ASC";
  return new Promise((resolve, reject) => {
    db.all(sql, projectId, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

ipcMain.handle('boardChildren', (_e, folderId) => {
  const sql =
    'SELECT p.id, p.title, p.content FROM page p JOIN store s ON s.page_id = p.id JOIN folder f ON f.id = s.folder_id WHERE f.id = ? ORDER BY s.position ASC';
  return new Promise((resolve, reject) => {
    db.all(sql, folderId, (error, rows) => {
      if (error) {
        reject(error);
      } else {
        resolve(rows);
      }
    });
  });
});

// table,position,id,type
ipcMain.on('updatePosition', (event, values) => {
  db.serialize(() => {
    db.run('BEGIN TRANSACTION;');
    values?.forEach((element) => {
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
  event.reply('updatePageList', values);
});

ipcMain.on('updateFolder', (_e, arg) => {
  let columns = '';
  for (const key in arg) {
    if (key != 'id') {
      const value = obj[key];
      columns += `${key} = ${value}`;
    }
  }
  const sql = `UPDATE folder SET ${columns} WHERE id = ${arg.id}`;
  console.log(sql);
});

ipcMain.on('destroyStore', (event, arg) => {
  const sql = 'DELETE FROM store WHERE page_id = ? AND folder_id = ?';
  const value = [arg.page_id, arg.folder_id];
  db.run(sql, value, (error) => {
    if (error) {
      console.log(error);
    }
  });
});

ipcMain.on('updateBoardPapers', (event, array) => {
  // それぞれに更新した内容を送信する。
  array.forEach((boardId) => {
    getBoardBody(event, boardId);
  });
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
        console.log(sqlLine);
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

function getBoardBody(event, boardId) {
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
