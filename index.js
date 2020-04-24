#! /usr/bin/env node

"use strict";

const os = require("os");
const fs = require("fs");
const fsp = require("fs").promises;

const axios = require("axios");
const unzipper = require("unzipper");
const chalk = require("chalk");

class ImgurDL {
  constructor(url) {
    this.init();
    this.code = url.split("/").pop();
    this.filename = `imgur-dl-${this.code}.zip`;
  }

  async init() {
    try {
      await fsp.mkdir(os.homedir() + "imgur-dl");
      console.log("Created imgur-dl directory in user home directory.");
    } catch (error) {
      console.log("imgur-dl directory exists. Will use.");
    }
  }

  async process() {
    console.log(chalk.blue.inverse("IMGUR-DL"));
    try {
      await this.download(this.code);
      this.unzip();
    } catch (error) {
      console.log(chalk.bold.red(`Error processing gallery`));
    }
  }

  async download(code) {
    console.log(`Downloading zip for gallery: ${code}`);
    const { data } = await axios.get(`https://imgur.com/a/${code}/zip`, {
      responseType: "arraybuffer",
      timeout: 5000,
    });

    const dataBuffer = Buffer.from(data);

    await fsp.writeFile(`./tmp.zip`, dataBuffer);
    console.log("Downloaded successfully");
  }

  unzip() {
    console.log("Unzipping files...");
    try {
      fs.createReadStream(`./tmp.zip`)
        .pipe(
          unzipper.Extract({ path: `${os.homedir()}/imgur-dl/${this.code}` })
        )
        .on("close", async () => {
          console.log("=".repeat(10));
          console.log(
            chalk.bold.green(
              `Files unzipped to ${os.homedir()}/imgur-dl/${this.code}`
            )
          );
          await fsp.unlink("./tmp.zip");
        });
    } catch (error) {
      throw error;
    }
  }
}

const url = process.argv[2];

new ImgurDL(url).process();
