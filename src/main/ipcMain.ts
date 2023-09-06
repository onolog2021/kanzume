import { ipcMain, Menu, MenuItem } from 'electron';
import fs from 'fs';
import path, { resolve } from 'path';
import { IpcMainEvent } from 'electron/main';
import { error, table } from 'console';
import { type } from 'os';
import { rejects } from 'assert';
import simpleGit from 'simple-git';
import { exec } from 'child_process';
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
// 単体レコードの更新
ipcMain.on('updateRecord', (_e, args) => {
  updateRecord(args);
});

// 複数レコードの取得
ipcMain.handle('fetchRecords', (event, args) => {
  return fetchRecords(args);
});

ipcMain.handle('findChildPage', (_e, folderId) => {
  const sql =
    'SELECT p.title, p.id FROM store s JOIN page p ON p.id = s.page_id WHERE s.folder_id = ? AND p.is_deleted = 0';
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

ipcMain.handle('getStores', (_e, projectId) => {
  const sql =
    'SELECT s.folder_id, s.page_id, s.position from store s JOIN page p ON p.id = s.page_id WHERE p.project_id = ? ORDER BY s.position ASC';
  return executeDbAll(sql, projectId);
});

ipcMain.handle('boardChildren', (_e, folderId) => {
  const sql =
    'SELECT p.id, p.title, p.content FROM page p JOIN store s ON s.page_id = p.id JOIN folder f ON f.id = s.folder_id WHERE f.id = ? AND p.is_deleted = 0 ORDER BY s.position ASC';
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
  updatePageList(args.projectId, event);
});

ipcMain.on('destroyStore', (event, arg) => {
  const sql = 'DELETE FROM store WHERE page_id = ? AND folder_id = ?';
  const value = [arg.page_id, arg.folder_id];
  executeDbRun(sql, value);
});

ipcMain.on('updateBoardPapers', (event, array) => {
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
    'SELECT p.id, p.title, p.content FROM page p JOIN store s ON s.page_id = p.id JOIN folder f ON f.id = s.folder_id WHERE f.id = ?  AND p.is_deleted = 0 ORDER BY s.position ASC';
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
    'SELECT id, title, position from page WHERE project_id = ? ORDER BY position ASC';
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
  const { columns, table } = args;
  return new Promise((resolve, reject) => {
    let sql = `INSERT INTO ${table}`;
    if (columns) {
      const insertColumns = Object.keys(columns).join(', ');
      sql += `(${insertColumns})`;
      const placeholder = Object.keys(columns)
        .map((key) => '?')
        .join(', ');
      sql += ` VALUES (${placeholder})`;
    }

    const values = Object.values(columns);

    db.run(sql, values, function (error) {
      if (error) {
        reject(error);
      } else {
        resolve(this.lastID);
      }
    });
  });
}

interface fetchRecordQuery {
  table: string;
  columns: string[];
  conditions: { [key: string]: any };
  order: [string, string];
  limit: number;
}

function fetchRecord(args: fetchRecordQuery) {
  const { table, columns } = args;
  const conditions = args.conditions || {};
  if (
    ['page', 'folder', 'project'].includes(table) &&
    !Object.keys(conditions).includes('is_deleted')
  ) {
    conditions.is_deleted = 0;
  }
  let sql;

  return new Promise((resolve, reject) => {
    if (columns) {
      const selectedColumns = columns.join(', ');
      sql = `SELECT ${selectedColumns} `;
    } else {
      sql = 'SELECT * ';
    }
    sql += `FROM ${table} `;
    const placeholder = Object.keys(conditions)
      .map((key) => `${key} = (?) `)
      .join('AND ');
    sql += `WHERE ${placeholder}`;
    const values = Object.values(conditions);
    db.get(sql, values, (error, row) => {
      if (error) {
        reject(error);
      } else {
        resolve(row);
      }
    });
  });
}

ipcMain.handle('fetchRecord', async (event, args) => {
  const result = await fetchRecord(args);
  return result;
});

ipcMain.handle('insertRecord', async (event, args) => {
  const result = await createRecord(args);
  return result;
});

// 複数レコードの取得
function fetchRecords(args) {
  const { columns, table, join, order, limit } = args;
  const conditions = args.conditions || {};
  if (
    ['page', 'folder', 'project'].includes(table) &&
    !Object.keys(conditions).includes('is_deleted')
  ) {
    conditions.is_deleted = 0;
  }
  return new Promise((resolve, reject) => {
    let query;
    if (columns) {
      query = `SELECT ${columns.join(', ')} FROM ${table}`;
    } else {
      query = `SELECT * FROM ${table}`;
    }

    if (join) {
      const joinSql = `JOIN ${join.table} ON ${join.conditions[0]} = ${join.conditions[1]}`;
      query += joinSql;
    }

    if (conditions && Object.keys(conditions).length > 0) {
      const placeholder = Object.keys(conditions)
        .map((key) => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${placeholder}`;
    }

    if (order) {
      query += ` ORDER BY ${order[0]} ${order[1]}`;
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const values = Object.values(conditions);

    db.all(query, values, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

ipcMain.on('mergeTextData', (event, args) => {
  const { folderName, pageIdArray, projectId } = args;
  // 該当テキストの取得
  let sql = 'SELECT content, id FROM page WHERE id in';
  const placeholder = pageIdArray.map((id) => '?').join(', ');
  sql += `(${placeholder})`;

  db.all(sql, pageIdArray, (error, rows) => {
    if (error) {
      console.log(error);
    } else {
      // テキストの結合
      let combinedBlocks = [];
      let version;
      rows.forEach((row) => {
        const textFragment = JSON.parse(row.content);
        combinedBlocks = combinedBlocks.concat(textFragment.blocks);
        version = textFragment.version;
      });

      const mergedText = {
        time: Date.now(),
        blocks: combinedBlocks,
        version,
      };

      const stringriedText = JSON.stringify(mergedText);

      const query = {
        table: 'page',
        columns: {
          title: folderName,
          content: stringriedText,
          project_id: projectId,
          position: -1,
        },
      };
      createRecord(query);
      event.reply('updatePageList', rows);
    }
  });
});

// 更新用SQLの作成
function createSqlStatementForUpdate(args) {
  const { table, columns, conditions } = args;
  let sql = `UPDATE ${table} `;
  const columnsPlaceholder = Object.keys(columns)
    .map((key) => `${key} = ?`)
    .join(', ');
  sql += `SET ${columnsPlaceholder} `;
  const conditionsPlaceholder = Object.keys(conditions)
    .map((key) => `${key} = ?`)
    .join(', ');
  sql += `WHERE ${conditionsPlaceholder}`;
  const values = [...Object.values(columns), ...Object.values(conditions)];
  return {
    sql,
    values,
  };
}

// 単体データの更新
function updateRecord(args) {
  const query = createSqlStatementForUpdate(args);
  const { sql, values } = query;
  return new Promise((resolve, reject) => {
    db.run(sql, values, (error) => {
      if (error) {
        reject(error);
      } else {
        return resolve;
      }
    });
  });
}

// 複数データの更新
function updateRecords(argsArray) {
  const hasError = false;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    argsArray.forEach((args) => {
      if (hasError) {
        return;
      }

      const query = createSqlStatementForUpdate(args);
      const { sql, values } = query;
      db.run(sql, values, (error) => {
        if (error) {
          hasError = true;
          db.run('ROLLBACK');
          console.error(error.message);
        }
      });
    });
    if (!hasError) {
      db.run('COMMIT');
    }
  });
}

ipcMain.on('deleteRecord', (event, args) => {
  destroyRecord(args);
});

function destroyRecord(args) {
  const { table, conditions } = args;
  let sql = `DELETE FROM ${table} `;
  const placeholder = Object.keys(conditions)
    .map((key) => `${key} = ?`)
    .join(' AND ');
  sql += `WHERE ${placeholder}`;
  const values = Object.values(conditions);
  db.run(sql, values, (error) => {
    console.error(error);
  });
}

function softDelete(args) {
  const { table, conditions } = args;
  let sql = `UPDATE ${table} SET is_deleted = ?`;
  const placeholder = Object.keys(conditions)
    .map((key) => `${key} = ?`)
    .join(' AND ');
  sql += ` WHERE ${placeholder}`;
  const values = [1].concat(Object.values(conditions));
  db.run(sql, values, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

ipcMain.on('softDelete', (event, args) => {
  softDelete(args);
});

ipcMain.on('runUpdateTrashIndex', (event) => {
  event.reply('updateTrashIndex');
});

ipcMain.on('runUpdatePageList', (event) => {
  event.reply('updatePageList');
});

ipcMain.on('runUpdateBoardList', (event) => {
  event.reply('updateBoardList');
});

ipcMain.on('exportText', (event, jsonText) => {
  const filename = 'test';
  const projectsFilePath = path.resolve(
    __dirname,
    '../../assets/projects',
    `${filename}.json`
  );
  fs.writeFile(projectsFilePath, JSON.stringify(jsonText, null, 2), (err) => {
    if (err) {
      console.error('JSONファイルの書き出しエラー:', err);
    } else {
      console.log('JSONファイルが正常に書き出されました:', projectsFilePath);
    }
  });
});

ipcMain.on('importText', async (event, pageId) => {
  const filename = 'test';
  const projectsFilePath = path.resolve(
    __dirname,
    '../../assets/projects',
    `${filename}.json`
  );

  const query = {
    table: 'page',
    conditions: {
      id: pageId,
    },
  };

  fs.readFile(projectsFilePath, 'utf-8', (err, data) => {
    if (err) throw err;
    query.columns = {
      content: data.toString(),
    };
    updateRecord(query);
  });
});

ipcMain.on('initProject', async (event, newId) => {
  const fileTitle = `${newId}`;
  const filePath = path.resolve(
    __dirname,
    '../../assets/projects',
    `${fileTitle}`
  );
  fs.mkdir(filePath, { recursive: true }, (error) => {
    if (error) throw error;
  });

  // git initを実行する
  const isGit = checkGit();
  if (isGit) {
    const git = simpleGit(filePath);
    git.init();
  }
});

// gitを導入しているか
function checkGit(): Boolean {
  exec('git --version', (error, stdout, stderr) => {
    if (error) {
      console.error('Git is not installed:', error);
      return false;
    }
    console.log('Git version:', stdout);
    return true;
  });
}
