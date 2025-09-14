module.exports = {
  process(sourceText, sourcePath, options) {
    // Replace import.meta.env.VITE_SUPABASE_URL with process.env.VITE_SUPABASE_URL
    const transformedSource = sourceText.replace(
      /import\.meta\.env\.VITE_SUPABASE_URL/g,
      'process.env.VITE_SUPABASE_URL'
    ).replace(
      /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g,
      'process.env.VITE_SUPABASE_ANON_KEY'
    );
    
    return {
      code: transformedSource,
      map: null
    };
  }
};