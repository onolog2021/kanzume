import { ipcMain, Menu, MenuItem, app, Shell, shell, dialog } from 'electron';
import fs from 'fs';
import path, { resolve } from 'path';
import { IpcMainEvent } from 'electron/main';
import { error, table } from 'console';
import { type } from 'os';
import { rejects } from 'assert';
import simpleGit from 'simple-git';
import { exec } from 'child_process';
import { getFonts } from 'font-list';
import sqlite3 from 'sqlite3';
import Store from 'electron-store';

const store = new Store();

// 外部SQLの実行
function executeSql(sqlFilePath: string, dbPath) {
  const db = new sqlite3.Database(dbPath);
  fs.readFile(sqlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('SQLファイルの読み込みエラー:', err);
      return;
    }
    db.exec(data, (err) => {
      if (err) {
        console.error('SQLの実行エラー:', err);
      }
    });
  });
}

// DB設定 ※windowsのみ対応
const appPath = app.isPackaged ? app.getPath('userData') : app.getAppPath();
const dbFolderPath = path.join(appPath, './data');

if (!fs.existsSync(dbFolderPath)) {
  fs.mkdirSync(dbFolderPath, { recursive: true });
}

const dbPath = path.join(dbFolderPath, './editor.db');

if (!fs.existsSync(dbPath)) {
  const localFolderPath = path.dirname(app.getPath('exe'));
  const sqlFilePath = app.isPackaged
    ? path.join(localFolderPath, './resources/editor.db.sql')
    : path.join(appPath, './editor.db.sql');
  executeSql(sqlFilePath, dbPath);
}

const db = new sqlite3.Database(dbPath);

const projectFolderPath = path.join(appPath, './project');
if (!fs.existsSync(projectFolderPath)) {
  fs.mkdirSync(projectFolderPath, { recursive: true });
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

function editorTextToPlaneText(json: JSON) {
  function extractText(node) {
    if (node.content) {
      return node.content.map(extractText).join('');
    }
    if (node.type === 'text') {
      return node.text;
    }
    return '';
  }

  function convertToPlainText(data) {
    return data.content.map(extractText).join('\n').trim();
  }

  const plainText = convertToPlainText(json);
  return plainText;
}

function transformForSite(json: JSON, site: 'kakuyomu' | 'narou') {
  function extractText(node) {
    if (node.content) {
      return node.content.map(extractText).join('');
    }
    if (node.type === 'text') {
      if (node.marks && node.marks[0].type !== 'bold') {
        if (site === 'narou' ) {
          return `|${node.text}《${node.marks[0].attrs.ruby}》`;
        }
        if (site === 'kakuyomu') {
          return `|${node.text}《${node.marks[0].attrs.ruby}》`;
        }
      }
      return node.text;
    }
    return '';
  }

  function convertToPlainText(data) {
    return data.content.map(extractText).join('\n').trim();
  }

  const plainText = convertToPlainText(json);
  return plainText;
}

// urlへ外部繊維
ipcMain.on('openURL', (event, url) => {
  shell.openExternal(url);
});

// 単体レコードの更新
ipcMain.handle('updateRecord', (_e, args) => {
  updateRecord(args);
});

// 複数レコードの取得
ipcMain.handle('fetchRecords', (event, args) => {
  return fetchRecords(args);
});

ipcMain.once('checkProjectGit', (event, projectId) => {
  const folderPath = path.join(projectFolderPath, `${projectId}`);
  const git = simpleGit(folderPath);

  git.revparse(['--is-inside-work-tree'], (err, result) => {
    if (err) {
      console.error('Not a git repository or an error occurred:', err);
      const hasGit = store.get('Git');
      if (hasGit) {
        git.init();
      }
      return;
    }

    if (result && result.trim() === 'true') {
      console.log('The directory is a valid git repository.');
    } else {
      console.log('The directory is not a git repository.');
    }
  });
});

ipcMain.handle('findChildPage', (_e, folderId) => {
  const sql =
    'SELECT p.title, p.id FROM store s JOIN page p ON p.id = s.page_id WHERE s.folder_id = ? AND p.is_deleted = 0';
  const value = [folderId];
  return executeDbAll(sql, value);
});

ipcMain.on('eventReply', (event, channel) => {
  event.reply(channel);
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
    'SELECT p.id, p.title, p.content, p.setting FROM page p JOIN store s ON s.page_id = p.id JOIN folder f ON f.id = s.folder_id WHERE f.id = ? AND p.is_deleted = 0 ORDER BY s.position ASC';
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
    let sql = `INSERT OR IGNORE INTO ${table}`;
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
        console.log(error);
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
  try {
    const result = await createRecord(args);
    return result;
  } catch (err) {
    console.log('insertRecord:', err);
  }
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
      let mergedText = [];
      rows.forEach((row) => {
        const pageData = JSON.parse(row.content);
        const textFragment = pageData.content;
        mergedText = [...mergedText, ...textFragment];
      });

      const newText = {
        type: 'doc',
        content: mergedText,
      };
      const stringriedText = JSON.stringify(newText);

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
  const updateDateTable = ['page', 'folder', 'project'];
  if (updateDateTable.includes(table)) {
    const currentTime = getCurrentTime();
    columns.updated_at = currentTime;
  }
  let sql = `UPDATE ${table} `;
  const columnsPlaceholder = Object.keys(columns)
    .map((key) => `${key} = ?`)
    .join(', ');
  sql += `SET ${columnsPlaceholder} `;
  const conditionsPlaceholder = Object.keys(conditions)
    .map((key) => `${key} = ? `)
    .join('AND ');
  sql += `WHERE ${conditionsPlaceholder}`;
  const values = [...Object.values(columns), ...Object.values(conditions)];
  return {
    sql,
    values,
  };
}

ipcMain.handle('updateRecords', (event, argsArray) => {
  updateRecords(argsArray);
});

// 単体データの更新
function updateRecord(args) {
  try {
    const query = createSqlStatementForUpdate(args);
    const { sql, values } = query;
    return new Promise((resolve, reject) => {
      db.run(sql, values, (error) => {
        if (error) {
          console.log(error);
          reject(error);
        } else {
          return resolve;
        }
      });
    });
  } catch (error) {
    console.error('An error occurred in updateRecord:', error);
    throw error;
  }
}

// 複数データの更新
function updateRecords(argsArray) {
  try {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        let errorOccurred = null;

        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            return reject(err.message);
          }

          for (let i = 0; i < argsArray.length; i++) {
            if (errorOccurred) {
              break;
            }

            const query = createSqlStatementForUpdate(argsArray[i]);
            const { sql, values } = query;

            db.run(sql, values, (error) => {
              if (error) {
                console.log(error);
                errorOccurred = error;
              }
            });
          }
        });

        if (errorOccurred) {
          reject(errorOccurred.message);
        } else {
          db.run('COMMIT', (err) => {
            if (err) {
              reject(err.message);
            } else {
              resolve(true);
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('An error occurred in updateRecords:', error);
    throw error;
  }
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
  let sql = `UPDATE ${table} SET is_deleted = ?, updated_at = ?`;
  const placeholder = Object.keys(conditions)
    .map((key) => `${key} = ?`)
    .join(' AND ');
  sql += ` WHERE ${placeholder}`;
  const deletedTime = getCurrentTime();
  const values = [1, deletedTime].concat(Object.values(conditions));
  db.run(sql, values, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

ipcMain.on('softDelete', (event, args) => {
  softDelete(args);
  event.reply('updateTrashIndex');
});

ipcMain.on('runUpdateTrashIndex', (event) => {
  event.reply('updateTrashIndex');
});

ipcMain.on('exportText', async (event, pageId) => {
  try {
    const query = {
      table: 'page',
      conditions: {
        id: pageId,
      },
    };
    const pageData = await fetchRecord(query);

    // 出力形式を選択
    const formatChoice = dialog.showMessageBoxSync({
      message: '出力形式を選択してください',
      buttons: ['プレーン', 'なろう', 'カクヨム'],
      cancelId: -1, // キャンセルボタンの場合のID
    });

    console.log(formatChoice);

    // ユーザーがキャンセルした場合
    if (formatChoice === -1) return;

    // デフォルトのファイル名と保存形式を設定
    const defaultFileName = pageData.title
      ? `${pageData.title}.txt`
      : 'untitled.txt';

    const reply = await dialog.showSaveDialog({
      title: 'ファイルを保存',
      defaultPath: defaultFileName, // デフォルトのファイル名を設定
      filters: [{ name: 'txt', extensions: ['txt'] }],
    });

    if (!reply.canceled && reply.filePath) {
      const { content } = pageData;
      let data;
      if (formatChoice === 2) {
        console.log('kakuyomu');
        data = content;
      } else if (formatChoice === 1) {
        console.log('narou');
        data = transformForSite(JSON.parse(content), 'narou');
      } else {
        data = editorTextToPlaneText(JSON.parse(content));
      }

      fs.writeFile(reply.filePath, data, (error) => {
        if (error) {
          console.error('Failed to save the file:', error);
        } else {
          console.log('File saved successfully!');
        }
      });
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

ipcMain.handle('importText', async (event, { projectId, pageId }) => {
  const pageFilePath = path.join(
    projectFolderPath,
    `${projectId}`,
    `${pageId}.json`
  );

  const { readFile } = fs.promises;

  try {
    const data = await readFile(pageFilePath, 'utf-8');
    const query = {
      table: 'page',
      columns: {
        content: data,
      },
      conditions: {
        id: pageId,
      },
    };
    updateRecord(query);
    return true;
  } catch (error) {
    console.error(error);
    throw error; // ipcMain.handleはエラーを自動的にキャッチして、rendererプロセスにエラーとして返します。
  }
});

ipcMain.on('initProject', async (event, newId) => {
  const fileTitle = `${newId}`;
  const filePath = path.join(projectFolderPath, `${fileTitle}`);
  fs.mkdir(filePath, { recursive: true }, (error) => {
    if (error) throw error;
  });

  // git initを実行する
  const hasGit = store.get('Git');
  if (hasGit) {
    const git = simpleGit(filePath);
    git.init();
  }
});

ipcMain.handle('commitPage', (event, pageId) => {
  return new Promise(async (resolve, reject) => {
    // 現在のページの内容を取得する
    const query = {
      table: 'page',
      conditions: {
        id: pageId,
      },
    };
    const page = await fetchRecord(query);

    // ページ内容をファイルに書き出す
    const projectFilePath = path.join(projectFolderPath, `${page.project_id}`);
    const pageFilePath = `${projectFilePath}/${page.id}.json`;

    const textJson = page.content;

    fs.writeFileSync(pageFilePath, textJson, (err) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Success:', projectFilePath);
      }
    });

    // 現在の内容をcommitする
    const hasGit = store.get('Git');
    if (hasGit) {
      const git = simpleGit(projectFilePath);
      const date = new Date();
      const time = dateTranslateForYYMMDD(date);
      try {
        await git.add(pageFilePath).commit(`${time}`);
        resolve(true);
      } catch (err) {
        console.log('error happen:', err);
        reject(err);
      }
    }
  });
});

ipcMain.handle('hasGit?', (event) => {
  const hasGit = store.get('Git');
  return hasGit;
});

ipcMain.handle('gitLog', async (event, { page_id, project_id }) => {
  const hasGit = store.get('Git');
  if (hasGit) {
    const projectFilePath = path.join(projectFolderPath, `${project_id}`);
    const git = simpleGit(projectFilePath);
    const pageFilePath = `${projectFilePath}/${page_id}.json`;

    try {
      const logList = await git.log([pageFilePath]);
      return logList;
    } catch (error) {
      console.error('Error fetching git log:', error);
      return null;
    }
  }
});

ipcMain.handle('gitShow', async (event, { pageId, hash, projectId }) => {
  const hasGit = store.get('Git');
  if (hasGit) {
    return new Promise((resolve, reject) => {
      const projectFilePath = path.join(projectFolderPath, `${projectId}`);

      const pageFilePath = `${pageId}.json`;

      const git = simpleGit(projectFilePath);
      git.show([`${hash}:${pageFilePath}`], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
});

ipcMain.handle('gitDiff', async (event, { pageId, hash, projectId }) => {
  const hasGit = store.get('Git');
  if (hasGit) {
    return new Promise((resolve, reject) => {
      const projectFilePath = path.join(projectFolderPath, `${projectId}`);

      const pageFilePath = `${pageId}.json`;

      const git = simpleGit(projectFilePath);
      git.diff([`${hash}`, 'HEAD', '-U0', pageFilePath], (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
});

ipcMain.handle('gitCheckOut', async (event, { pageId, hash, projectId }) => {
  const hasGit = store.get('Git');
  if (!hasGit) {
    return;
  }
  const projectFilePath = path.join(projectFolderPath, `${projectId}`);

  const pageFilePath = `${pageId}.json`;

  const git = simpleGit(projectFilePath);

  const option = [hash, '--', pageFilePath];

  await git.checkout(option, (error, result) => {
    if (error) {
      console.log(error);
      return error;
    }
    return true;
  });
});

ipcMain.on('openFolder', (event, folderId) => {
  event.reply('openFolder', folderId);
});

function dateTranslateForYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function getCurrentTime() {
  const currentDate = new Date();
  const offset = currentDate.getTimezoneOffset() * 60000;
  const localISOTime = new Date(currentDate - offset)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  return localISOTime;
}

ipcMain.handle('getFonts', async () => {
  const list = await getFonts();
  return list;
});

ipcMain.on('storeSet', (event, storePare) => {
  const { key, value } = storePare;
  store.set(key, value);
});

ipcMain.handle('storeGet', (event, key) => {
  const value = store.get(key);
  return value;
});
