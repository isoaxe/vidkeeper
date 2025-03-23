import { program } from 'commander';
import ufd from 'universal-file-downloader';
import jsdom from 'jsdom';
import path from 'path';
import fs from 'fs';
import readline from 'readline';
import { homedir } from 'os';

const { JSDOM } = jsdom;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify the question method
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

program
  .version('1.0.0')
  .action(async () => {
    try {
      // Prompt for URL
      const url = await question('Enter the video URL: ');
      
      // Fetch page content
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse DOM for media sources
      const dom = new JSDOM(html);
      const sources = [
        ...dom.window.document.querySelectorAll('video[src], video source')
      ].map(el => el.src || el.getAttribute('src')).filter(Boolean);

      if (!sources.length) throw new Error('No video sources found');
      
      // Download first found source
      const videoUrl = new URL(sources[0], url).href;
      console.log('Attempting to download:', videoUrl);
      
      const downloadPath = path.join(homedir(), 'Downloads/vidkeeper', 'download.mp4');
      
      // Create directory if it doesn't exist
      const directory = path.dirname(downloadPath);
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      const Downloader = ufd.default || ufd;
      const downloader = new Downloader(downloadPath);
      await downloader.downloadFile(videoUrl);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      rl.close();
    }
  });

program.parse();
