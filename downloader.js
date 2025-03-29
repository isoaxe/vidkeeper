import { program } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { homedir } from 'os';
import readline from 'readline';

const execAsync = promisify(exec);

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
      const url = await question('Enter the video URL: ');
      
      // Set download path to Downloads folder
      const downloadPath = path.join(homedir(), 'Downloads/vidkeeper', '%(title)s.%(ext)s');
      
      console.log('Starting download...');
      
      // Use yt-dlp to get the video
      const { stdout, stderr } = await execAsync(
        `yt-dlp -f "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4] / bv*+ba/b" "${url}" -o "${downloadPath}"`
      );
      
      console.log('Download completed successfully');
      console.log(stdout);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      rl.close();
    }
  });

program.parse();
