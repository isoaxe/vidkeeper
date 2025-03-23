import { program } from 'commander';
import ufd from 'universal-file-downloader';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import fs from 'fs';
import path from 'path';

program
  .version('1.0.0')
  .argument('<url>', 'Video page URL')
  .action(async (url) => {
    try {
      // Fetch page content
      const response = await fetch(url);
      const html = await response.text();
      
      // Parse DOM for media sources
      const dom = new JSDOM(html);
      const document = dom.window.document;
      
      // Log all video elements found for debugging
      console.log('Found video elements:', 
        [...document.querySelectorAll('video')].map(el => ({
          src: el.src,
          sources: [...el.querySelectorAll('source')].map(s => s.src)
        }))
      );
      
      // Look for both video src and source elements
      const sources = [
        ...document.querySelectorAll('video[src], video source')
      ].map(el => el.src || el.getAttribute('src')).filter(Boolean);

      if (!sources.length) throw new Error('No video sources found');
      
      // Download first found source
      const videoUrl = new URL(sources[0], url).href;
      console.log('Attempting to download:', videoUrl);
      
      // Specify custom download path
      const downloadPath = './downloads/download.mp4';
      const directory = path.dirname(downloadPath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
      }
      
      const Downloader = ufd.default || ufd;
      const downloader = new Downloader(downloadPath);
      await downloader.downloadFile(videoUrl);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
