import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'CarePath-super-secure-production-jwt-token-2026',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
};
