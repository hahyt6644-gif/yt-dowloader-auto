import youtubedl from 'youtube-dl-exec';

export default async function handler(req, res) {
  const { videoUrl } = req.query;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl query parameter' });
  }

  try {
    // Fetch video info with no download, json output
    const info = await youtubedl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      // Add any other yt-dlp compatible flags as needed here
    });

    // Extract particular formats URLs (360p, 480p, 720p, audio)
    const formats = info.formats || [];
    const result = {
      '360p': null,
      '480p': null,
      '720p': null,
      'audio': null,
    };

    formats.forEach((fmt) => {
      if (fmt.height === 360 && !result['360p']) result['360p'] = fmt.url;
      if (fmt.height === 480 && !result['480p']) result['480p'] = fmt.url;
      if (fmt.height === 720 && !result['720p']) result['720p'] = fmt.url;
      if (fmt.acodec !== 'none' && fmt.vcodec === 'none' && !result['audio']) result['audio'] = fmt.url;
    });

    res.status(200).json({
      title: info.title,
      thumbnail: info.thumbnail,
      video_url: info.webpage_url,
      formats: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
