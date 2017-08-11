const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');

const workingDir = process.cwd();

/**
 * @typedef {Object} AutoHashConfigWithFile - configuration of AutoHash
 * @property {string} c - config file path
 * @property {string} config - config file path
 */

/**
 * @typedef {Object} AutoHashConfigWithObject - configuration of AutoHash
 * @property {Object[]} files - file list to be hashed
 * @property {string} files[].file - file path
 * @property {string=} files[].name - key to use in hash object
 * @property {{file: string=}=} output - output file path of hashes
 * @property {number=} len - length of MD5 to be used
 * @property {boolean=} rename - rename original file to originalFilename.hash.ext
 * @property {boolean=} copy - create a copy of original file in originalFilename.hash.ext
 */

/**
 * @typedef {AutoHashConfigWithFile|AutoHashConfigWithObject} AutoHashConfig - configuration
 */
let config = {};

/**
 * calculate MD5 of the file buffer.
 * @param {Buffer} buffer - file buffer
 * @return {string} MD5 hash
 * @private
 */
function fileMD5(buffer) {
  const fsHash = crypto.createHash('md5');
  fsHash.update(buffer);
  let hash = fsHash.digest('hex');
  if (config.len) {
    hash = hash.substr(0, config.len);
  }
  return hash;
}

/**
 * generate new file path in /original/file/path/originalFilename.hash.ext
 * @param {string} filePath - original file path
 * @param {string} hash - file hash
 * @return {string} - file path with hash in file name
 * @private
 */
function cpFilePath(filePath, hash) {
  const pathObj = path.parse(filePath);
  if (pathObj.base) {
    const base = pathObj.base.split('.');
    base.splice(-1, 0, hash);
    pathObj.base = base.join('.');
  } else {
    pathObj.name += `.${hash}`;
  }
  return path.format(pathObj);
}

/**
 * rename original file to orignalFilename.hash.ext
 * @param {string} filePath 
 * @param {string} hash 
 * @private
 */
function renameFile(filePath, hash) {
  const newPath = cpFilePath(filePath, hash);
  fs.renameSync(filePath, newPath);
}

/**
 * create a copy of original file in same path in originalFilename.hash.ext
 * @param {string} filePath 
 * @param {string} hash  
 * @private
 */
function copyFile(filePath, hash) {
  const newPath = cpFilePath(filePath, hash);
  fs.createReadStream(filePath).pipe(fs.createWriteStream(newPath));
}

/**
 * load specific config file
 * @param {string} configPath 
 * @private
 */
function loadConfig(configPath) {
  config = JSON.parse(fs.readFileSync(path.resolve(workingDir, configPath)));
}

/**
 * 1. load auto-hash config(config file or parameter)
 * 2. generate hash value of each file
 * 2.1 (optional) rename file or create a copy of it
 * 2.2 assign hashes to an object
 * 3. (optional) output hashes to file
 * 4. return hashes
 * @param {AutoHashConfig} argv - AutoHash configuration
 * @return {Object.<string, string>} hashes
 */
function autoHash(argv) {
  if (argv.c || argv.config) {
    const configFilePath = argv.c || argv.config;
    loadConfig(configFilePath);
  } else if (Array.isArray(argv.files)) {
    config = argv;
  } else {
    loadConfig('./auto-hash.config.json');
  }
  if (!(Array.isArray(config.files) && config.files.length)) {
    throw new Error('Missing file list');
  }
  const hashes = {};
  config.files.forEach(fileObj => {
    let filePath;
    let fileHash;
    if (typeof fileObj === 'object') {
      if (!fileObj.file) {
        return;
      }
      filePath = path.resolve(workingDir, fileObj.file);
      const file = fs.readFileSync(filePath);
      fileHash = fileMD5(file);
      if (fileObj.name) {
        hashes[fileObj.name] = fileHash;
      } else {
        const fileInfo = path.parse(filePath);
        hashes[fileInfo.name] = fileHash;
      }
    } else if (typeof fileObj === 'string') {
      filePath = path.resolve(workingDir, fileObj);
      const file = fs.readFileSync(filePath);
      fileHash = fileMD5(file);
      const fileInfo = path.parse(filePath);
      hashes[fileInfo.name] = fileHash;
    }
    if (config.rename) {
      renameFile(filePath, fileHash);
    } else if (config.copy) {
      copyFile(filePath, fileHash);
    }
  });
  if (config.output && config.output.file) {
    const fileContent = `module.exports = ${util.inspect(hashes)};`;
    fs.writeFileSync(config.output.file, fileContent);
  }
  return hashes;
}

/**
 * AutoHash
 * @exports autoHash
 */
module.exports = autoHash;
