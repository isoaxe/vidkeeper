# VidKeeper

A simple command-line tool for downloading videos and audio from various online platforms using yt-dlp.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- yt-dlp (required for general video downloading)
- FFmpeg (required for high-quality YouTube downloads)

### Installing yt-dlp

#### macOS
```bash
brew install yt-dlp
```

#### Linux
```bash
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

#### Windows
```bash
winget install yt-dlp
```

### Installing FFmpeg

#### macOS
```bash
brew install ffmpeg
```

#### Linux
```bash
sudo apt-get install ffmpeg
```

#### Windows
```bash
winget install ffmpeg
```

## Installation

1. Clone this repository:
```bash
git clone https://github.com/isoaxe/vidkeeper.git
cd vidkeeper
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the application:
```bash
npm start
```

2. When prompted, enter the URL of the video you want to download.

3. Choose whether to download video (v) or audio only (a).

4. The content will be downloaded to your Downloads folder in a `vidkeeper` subdirectory.

## Features

- Downloads videos in the best available quality
- Supports audio-only downloads in M4A format
- Automatically saves to your Downloads folder
- Simple command-line interface
- Supports multiple video platforms (YouTube, Vimeo, etc.)
- Optimized for QuickTime compatibility
- Automatic cleanup of temporary files

## License

ISC 