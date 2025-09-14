export default {
  process(sourceText, sourcePath, options) {
    // Replace import.meta.env.VITE_SUPABASE_URL with a test value
    const transformedSource = sourceText.replace(
      /import\.meta\.env\.VITE_SUPABASE_URL/g,
      '"https://test.supabase.co"'
    ).replace(
      /import\.meta\.env\.VITE_SUPABASE_ANON_KEY/g,
      '"test-anon-key"'
    );
    
    return {
      code: transformedSource,
      map: null
    };
  }
};