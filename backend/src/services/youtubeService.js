const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

/**
 * Searches YouTube for up to `maxResults` videos matching a query and
 * returns them shaped as "resources" ready to attach to a lesson.
 * Fails soft: if the API errors (quota, missing key, etc.) we return an
 * empty array instead of breaking the whole course generation.
 */
export async function searchYoutubeVideos(query, maxResults = 3) {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("[youtube] YOUTUBE_API_KEY not set - skipping video search");
    return [];
  }

  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(maxResults),
    safeSearch: "strict",
    relevanceLanguage: "en",
    key: apiKey,
  });

  try {
    const res = await fetch(`${YOUTUBE_SEARCH_URL}?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("[youtube] API error:", data?.error?.message || res.statusText);
      return [];
    }

    return (data.items || []).map((item) => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channelTitle: item.snippet.channelTitle,
      source: "youtube",
    }));
  } catch (err) {
    console.error("[youtube] request failed:", err.message);
    return [];
  }
}

/**
 * Given the Gemini-generated modules (each lesson has a `searchQuery`),
 * fetches real YouTube resources for every lesson and attaches them.
 * Runs all lesson searches in parallel to keep total request time low.
 */
export async function attachResourcesToModules(modules) {
  const allLessons = modules.flatMap((m) => m.lessons);

  const resourcesByLesson = await Promise.all(
    allLessons.map((lesson) => searchYoutubeVideos(lesson.searchQuery))
  );

  let i = 0;
  return modules.map((module) => ({
    title: module.title,
    lessons: module.lessons.map((lesson) => ({
      title: lesson.title,
      description: lesson.description,
      resources: resourcesByLesson[i++],
    })),
  }));
}
