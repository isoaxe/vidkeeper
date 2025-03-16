import { program } from 'commander';
import ufd from 'universal-file-downloader';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

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
      const sources = [
        ...dom.window.document.querySelectorAll('video, embed, iframe')
      ].map(el => el.src).filter(Boolean);

      if (!sources.length) throw new Error('No video sources found');
      
      // Download first found source
      const videoUrl = new URL(sources[0], url).href;
      await new ufd('download.mp4').downloadFile(videoUrl);
      
      console.log('Download completed successfully');
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse();
