
const {readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync} = require('fs');
import {join, basename} from 'path';
import ganache from 'ganache-cli';
import { ethers } from "ethers";
import {Artifacts} from '@zapjs/artifacts';
import { promisify } from 'util';
import {ganacheServerOptions, DEFAULT_GAS, GAS_PRICE, buildOptions, migrate} from '../constants';
import {serverOptionsType, buildOptionsType} from '../types';
const asyncMigrate = promisify(migrate.run);
async function sleep(ms:number){ return new Promise(resolve=>setTimeout(resolve, ms)); }


/**
 * @ignore
 * @param _serverOptions
 * @returns {Promise<any>}
 */
export async function startGanacheServer(_serverOptions ?: any){
    try {
        const serverOptions = _serverOptions || ganacheServerOptions;
        const flag = await isPortTaken(serverOptions.port);
        if (!flag) {
            const ganacheServer = ganache.server(serverOptions);
            ganacheServer.listen(serverOptions.port);
            return ganacheServer;
        }
    } catch (e){
        console.error('Failed to start ganache sever, retrying ');
        setTimeout(()=>{ startGanacheServer(_serverOptions); }, 1000);
    }
}

/**
 *
 * @param port
 */
const isPortTaken = (port) => {
    return new Promise((resolve, reject) => {
        const tester = require('http').createServer();
        tester.once('error', err => err.code == 'EADDRINUSE' ? resolve(true) : reject(err));
        tester.once('listening', () => tester.once('close', () => resolve(false)).close());
        tester.listen(port);
    });
};

/**
 * @ignore
 * @param {boolean} onlyRemoveNetworks
 * @param {string} buildDir
 */
export function clearBuild(onlyRemoveNetworks = true, buildDir:string) {
    if (!existsSync(buildDir)){
        mkdirSync(buildDir);
    }
    const files = readdirSync(buildDir + '');

    for (let i = 0; i < files.length; i++) {
        const filePath = buildDir + '/' + files[i];
        if (onlyRemoveNetworks) {
            const compiledJson = JSON.parse(readFileSync(filePath));
            if (!compiledJson.networks) {
                continue;
            }
            compiledJson.networks = {};
            writeFileSync(filePath, JSON.stringify(compiledJson), {flag: 'w'});
            //console.log('deployment info for file ' + filePath + ' was cleared.');
        } else {
            try {
                if (filePath.endsWith('.json')){
                    unlinkSync(filePath);
                    //console.log('file ' + filePath + ' was deleted.');
                }
            } catch (e){ console.error(e); }
        }
    }
}

/**
 * @ignore
 * @param {string} buildDir
 * @returns {any}
 */
export function getArtifacts(buildDir:string){
    const artifacts:any = {};
    readdirSync(buildDir).forEach(function (file:string) {

        /* If its the current file ignore it */
        if (!file.endsWith('.json')) return;

        /* Store module with its name (from filename) */
        artifacts[basename(file, '.json')] = require(join(buildDir, file));
    });
    return artifacts;

}

/**
 * @ignore
 * @param {string} buildDir
 * @param {serverOptionsType} _serverOptions
 * @returns {Promise<boolean>}
 */
export async function migrateContracts(buildDir:string, _serverOptions ?:serverOptionsType) {
    console.log('Begin contract migration');
    console.log('Deploy token')

    const serverOpts = _serverOptions || ganacheServerOptions;
    const buildOpts:buildOptionsType = buildOptions;
    buildOpts.contracts_build_directory = buildDir;
    const options = Object.assign(serverOpts, buildOpts);
    try {
        clearBuild(false, buildDir);
        console.log("running all");
        migrate.run(options);
        await sleep(20 * 1000);
        return true;
    } catch (err) {
        console.error('Error Migrating Contracts', err);
        return true;
    }
}

export * from '../constants';
