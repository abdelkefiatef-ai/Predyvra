<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Sentinel - Cybersecurity War-Gaming Platform

An AI-powered cybersecurity platform that continuously war-games your network to detect threats before they happen.

## Features

- Digital Twin Network Mapping
- Identity & Privilege Management
- Real-time Telemetry Monitoring
- AI-Powered War Game Simulations
- Automated Threat Detection

## Run Locally

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   - `LLM_API_KEY` - Your OpenAI or compatible LLM API key (required for simulations)
   - `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` - Optional Neo4j database for advanced topology storage

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Environment Variables

See `.env` file for all available configuration options:
- **LLM Configuration**: Required for War Game simulations
- **Neo4j Configuration**: Optional for graph database storage
- **Supabase Configuration**: Pre-configured for the platform
