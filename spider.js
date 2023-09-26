#!/usr/bin/env node

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const path = require('path');
const { program } = require('commander');

program
	.option('-r, --recursive', 'Recursively download images')
	.option('-l, --max-depth <N>', 'Maximum depth level for recursive download', 5)
	.option('-p, --path <path>', 'Path where downloaded files will be saved', './data')
	.argument('url', 'URL to start scraping')
	.parse(process.argv);

const options = program.opts();
const url = program.args[0];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
const outputDirectory = './images';

axios.get(url)
	.then(response => {
		const $ = cheerio.load(response.data);
		const imageUrls = [];
		$('img').each(async (index, element) => {
			var imageUrl = $(element).attr('src');
			if (imageUrl) {
				const extension = path.extname(imageUrl).toLowerCase();
				if (imageExtensions.includes(extension)) {
					const filename = path.basename(imageUrl);
					const outputPath = path.join(outputDirectory, filename);
					try {
						if (!imageUrl.startsWith('https://'))
							imageUrl = url + imageUrl;
						imageUrls.push(imageUrl);
						const response1 = await axios.get(imageUrl, { responseType: 'stream' });
						const writer = response1.data.pipe(fs.createWriteStream(outputPath));
						return new Promise((resolve, reject) => {
							writer.on('finish', resolve);
							writer.on('error', reject);
						});
					} catch (error) {
						throw error
					}
				}
			}
		});
    })
	.catch(error => console.error(error));
