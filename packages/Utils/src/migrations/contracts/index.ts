const {join,basename} =require("path");
import {readdirSync} from 'fs'

/**
 * @ignore
 * @returns {any}
 */
export function contracts(){
  let artifacts:any = {}
  readdirSync(__dirname).forEach(function (file) {

    /* If its the current file ignore it */
    if (!file.endsWith('.json')) return;

    /* Store module with its name (from filename) */
    artifacts[basename(file, '.json')] = require(join(__dirname, file));
  });
  return artifacts

}
