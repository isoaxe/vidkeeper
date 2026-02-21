import { program } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { homedir } from 'os';
import readline from 'readline';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Common yt-dlp flags to reduce noise
const YT_DLP_FLAGS = '--no-warnings --no-progress';

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
      
      // Ask for download type
      const downloadType = await question('What would you like to download? (v) Video or (a) Audio [default: v]: ');
      
      // Set download path to Downloads folder
      const downloadPath = path.join(homedir(), 'Downloads/vidkeeper');
      const tempPath = path.join(downloadPath, 'temp');
      
      // Create directories if they don't exist
      await fs.mkdir(downloadPath, { recursive: true });
      await fs.mkdir(tempPath, { recursive: true });
      
      // First get the video title
      const { stdout: titleStdout } = await execAsync(
        `yt-dlp ${YT_DLP_FLAGS} --get-title "${url}"`
      );
      const videoTitle = titleStdout.trim().replace(/[<>:"/\\|?*]/g, '_');
      
      // Define finalPath here so it's available for cleanup and success message
      const finalPath = path.join(downloadPath, `${videoTitle}.mp4`);
      
      // Check if URL is from YouTube
      const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
      
      if (isYouTube) {
        if (downloadType.toLowerCase() === 'a') {
          console.log('Downloading audio only...');
          // Download best audio quality
          const audioPath = path.join(tempPath, 'audio.m4a');
          const { stdout: audioStdout, stderr: audioStderr } = await execAsync(
            `yt-dlp ${YT_DLP_FLAGS} -f "bestaudio[ext=m4a]" --no-keep-video "${url}" -o "${audioPath}"`
          );

          if (audioStderr) {
            console.log('Audio download warning:', audioStderr);
          }
          
          // Move audio file to final path
          await fs.rename(audioPath, finalPath.replace('.mp4', '.m4a'));
        } else {
          console.log('Downloading YouTube video in best quality...');
          
          // Download best video quality with H.264 codec
          const videoPath = path.join(tempPath, 'video.mp4');
          const { stdout: videoStdout, stderr: videoStderr } = await execAsync(
            `yt-dlp ${YT_DLP_FLAGS} -f "bestvideo[ext=mp4][vcodec^=avc1]" --no-keep-video "${url}" -o "${videoPath}"`
          );
          
          if (videoStderr) {
            console.log('Video download warning:', videoStderr);
          }
          
          // Download best audio quality with AAC codec
          const audioPath = path.join(tempPath, 'audio.m4a');
          const { stdout: audioStdout, stderr: audioStderr } = await execAsync(
            `yt-dlp ${YT_DLP_FLAGS} -f "bestaudio[ext=m4a][acodec^=mp4a]" --no-keep-video "${url}" -o "${audioPath}"`
          );
          
          if (audioStderr) {
            console.log('Audio download warning:', audioStderr);
          }
          
          console.log('Merging video and audio with ffmpeg for QuickTime compatibility...');
          
          // Merge video and audio using ffmpeg with QuickTime-compatible settings
          await execAsync(
            `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -movflags +faststart -brand mp42 "${finalPath}"`
          );
        }
      } else {
        console.log('Downloading video in best quality...');
        
        // PHP/generic sites often require Referer and browser-like User-Agent
        const { origin } = new URL(url);
        const refererHeader = `--add-header "Referer:${origin}/"`;
        const userAgent =
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' +
          'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        const phpWorkaroundFlags = `${refererHeader} --add-header "User-Agent:${userAgent}"`;
        
        const { stdout, stderr } = await execAsync(
          `yt-dlp ${YT_DLP_FLAGS} ${phpWorkaroundFlags} "${url}" -o "${finalPath}"`
        );
        
        if (stderr) {
          console.log('Download warning:', stderr);
        }
      }
      
      // Clean up temporary files
      await fs.rm(tempPath, { recursive: true, force: true });
      
      console.log('Download and processing completed successfully');
      console.log('Final video saved to:', finalPath);
    } catch (error) {
      console.error('Error:', error.message);
    } finally {
      rl.close();
    }
  });

program.parse();
