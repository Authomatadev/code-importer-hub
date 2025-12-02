-- Update plans to use lowercase distance values to match user_profiles constraint
UPDATE plans SET distance = LOWER(distance) WHERE distance IN ('10K', '21K', '42K');