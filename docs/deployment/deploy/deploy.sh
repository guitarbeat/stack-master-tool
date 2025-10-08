#!/bin/bash
set -e

# Stack Facilitation App Deployment Script (Frontend-only with Supabase)
# Supports deployment targets: Render, Vercel, Netlify

DEPLOYMENT_TARGET=${1:-"vercel"}
APP_NAME="stack-facilitation"

echo "🚀 Deploying Stack Facilitation App to $DEPLOYMENT_TARGET (Frontend-only with Supabase)"

# Check if required tools are installed
check_dependencies() {
	case $DEPLOYMENT_TARGET in
		"vercel")
			if ! command -v vercel &> /dev/null; then
				echo "❌ Vercel CLI is not installed. Please install it first:"
				echo "   npm install -g vercel"
				exit 1
			fi
			;;
		"netlify")
			if ! command -v netlify &> /dev/null; then
				echo "❌ Netlify CLI is not installed. Please install it first:"
				echo "   npm install -g netlify-cli"
				exit 1
			fi
			;;
		"render")
			# No CLI required; guide-based deployment
			;;
	esac
}

# Build the application
build_and_test() {
	echo "📦 Building application..."
	
	# Install dependencies and build
	npm install
	npm run build
	
	echo "✅ Build completed"
	echo "🧪 Running tests..."
	npm run test:run
	
	echo "✅ All tests passed"
}

# Deploy to Vercel
deploy_vercel() {
	echo "▲ Deploying to Vercel..."
	
	# Deploy to Vercel
	vercel --prod
	
	echo "✅ Deployed to Vercel"
	echo "🔧 Don't forget to set environment variables in Vercel dashboard:"
	echo "   - VITE_SUPABASE_URL=your_supabase_url"
	echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
}

# Deploy to Netlify
deploy_netlify() {
	echo "🌐 Deploying to Netlify..."
	
	# Deploy to Netlify
	netlify deploy --prod --dir=dist
	
	echo "✅ Deployed to Netlify"
	echo "🔧 Don't forget to set environment variables in Netlify dashboard:"
	echo "   - VITE_SUPABASE_URL=your_supabase_url"
	echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
}

# Deploy to Render (instructions output)
deploy_render() {
	echo "🎨 Deploying to Render..."
	echo "Please follow these steps:"
	echo "1. Push your code to GitHub"
	echo "2. Connect your GitHub repo to Render"
	echo "3. Create a Static Site service:"
	echo "   - Root Directory: ."
	echo "   - Build Command: npm install && npm run build"
	echo "   - Publish Directory: dist"
	echo "4. Set environment variables in Render:"
	echo "   - VITE_SUPABASE_URL=your_supabase_url"
	echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
}

# Deploy to Railway (Static Site)
deploy_railway() {
	echo "🚂 Deploying to Railway..."
	
	if ! command -v railway &> /dev/null; then
		echo "❌ Railway CLI is not installed. Please install it first:"
		echo "   npm install -g @railway/cli"
		exit 1
	fi
	
	# Login and deploy
	railway login
	railway link
	railway up
	
	echo "✅ Deployed to Railway"
	echo "🔧 Don't forget to set environment variables in Railway dashboard:"
	echo "   - VITE_SUPABASE_URL=your_supabase_url"
	echo "   - VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
}

# Main deployment flow
main() {
	echo "🏗️ Starting deployment process..."
	
	check_dependencies
	build_and_test
	
	case $DEPLOYMENT_TARGET in
		"vercel")
			deploy_vercel
			;;
		"netlify")
			deploy_netlify
			;;
		"render")
			deploy_render
			;;
		"railway")
			deploy_railway
			;;
		*)
			echo "❌ Unknown deployment target: $DEPLOYMENT_TARGET"
			echo "Supported targets: vercel, netlify, render, railway"
			exit 1
			;;
	esac
	
	echo "🎉 Deployment completed successfully!"
}

# Run main function
main

