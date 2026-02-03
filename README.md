# Laravel Vue Starter Kit

A modern Laravel application with Vue.js frontend, built with Inertia.js for seamless SPA experience and enhanced with Laravel's latest ecosystem packages.

## Tech Stack

### Backend

- **Laravel 12** - Latest Laravel framework with streamlined structure
- **PHP 8.5.2** - Modern PHP with latest features
- **Laravel Fortify** - Headless authentication backend
- **Laravel Wayfinder** - TypeScript route generation
- **Laravel Boost** - Development tools and MCP server
- **SQLite** - Default database (configurable)

### Frontend

- **Vue 3** - Progressive JavaScript framework
- **Inertia.js v2** - Modern monolith with SPA benefits
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS v4** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Reka UI** - Vue component library
- **Pinia** - Vue state management

### Development Tools

- **Laravel Pint** - PHP code formatter
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **PHPUnit** - PHP testing framework
- **Vitest** - JavaScript testing framework
- **Husky** - Git hooks

## Features

- 🔐 **Authentication System** - Complete auth with Laravel Fortify
- 🎨 **Modern UI** - Tailwind CSS with component library
- 🚀 **SPA Experience** - Inertia.js for seamless navigation
- 📱 **Responsive Design** - Mobile-first approach
- 🔧 **Type Safety** - Full TypeScript integration
- 🧪 **Testing Ready** - PHPUnit and Vitest configured
- 🎯 **Route Generation** - TypeScript functions for Laravel routes
- 🔄 **Hot Reload** - Fast development with Vite
- 📦 **Component System** - Reusable Vue components
- 🎭 **SSR Support** - Server-side rendering capability

## Quick Start

### Prerequisites

- PHP 8.2+
- Node.js 18+
- Composer
- npm or yarn

### Installation

1. **Clone and setup the project:**

```bash
git clone <repository-url>
cd <project-name>
composer run setup
```

This single command will:

- Install PHP dependencies
- Copy environment file
- Generate application key
- Run database migrations
- Install Node.js dependencies
- Build frontend assets

2. **Start development servers:**

```bash
composer run dev
```

This starts all development services:

- Laravel server (http://localhost:8000)
- Queue worker
- Log viewer (Pail)
- Vite dev server with HMR

### Alternative Setup

If you prefer manual setup:

```bash
# Install dependencies
composer install
npm install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate

# Build assets
npm run build

# Start development
php artisan serve
npm run dev  # In another terminal
```

## Development

### Available Scripts

#### Composer Scripts

```bash
composer run dev          # Start all development services
composer run dev:ssr      # Start with SSR support
composer run setup        # Complete project setup
composer run lint         # Format PHP code with Pint
composer run test         # Run all tests with linting
```

#### NPM Scripts

```bash
npm run dev              # Start Vite dev server
npm run build            # Build for production
npm run build:ssr        # Build with SSR support
npm run lint             # Lint and fix JS/TS/Vue files
npm run format           # Format code with Prettier
```

### Project Structure

```
├── app/
│   ├── Actions/Fortify/     # Authentication actions
│   ├── Http/Controllers/    # Laravel controllers
│   ├── Models/             # Eloquent models
│   └── Providers/          # Service providers
├── resources/
│   ├── js/
│   │   ├── actions/        # Wayfinder generated actions
│   │   ├── components/     # Vue components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Inertia pages
│   │   ├── routes/         # Wayfinder generated routes
│   │   └── types/          # TypeScript definitions
│   └── css/               # Stylesheets
├── routes/                # Laravel routes
├── database/              # Migrations, factories, seeders
└── tests/                 # PHPUnit tests
```

### Key Concepts

#### Inertia.js Pages

Pages are Vue components in `resources/js/pages/`. They're rendered by Laravel controllers using `Inertia::render()`.

#### Wayfinder Routes

Import Laravel routes as TypeScript functions:

```typescript
// For controllers
import StorePost from '@/actions/PostController';
StorePost({ title: 'Hello' });

// For named routes
import { posts } from '@/routes';
posts.show({ id: 1 });
```

#### Authentication

Laravel Fortify provides headless authentication. Frontend auth components are in `resources/js/pages/auth/`.

#### Components

Reusable Vue components in `resources/js/components/` using Reka UI and Tailwind CSS.

## Testing

### Running Tests

```bash
# Run all tests
composer run test

# PHP tests only
php artisan test --compact

# JavaScript tests only
npm run test

# Run specific test file
php artisan test --compact tests/Feature/ExampleTest.php

# Run with filter
php artisan test --compact --filter=testName
```

### Writing Tests

- PHP tests use PHPUnit in `tests/` directory
- JavaScript tests use Vitest
- Follow existing test patterns and conventions

## Deployment

### Production Build

```bash
# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci

# Build assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Environment Variables

Key environment variables to configure:

```env
APP_NAME=Laravel
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
```

## Code Style

### PHP

- Laravel Pint enforces PSR-12 standards
- Run `composer run lint` to format code
- Use PHP 8+ features and type declarations

### JavaScript/TypeScript

- ESLint with Vue and TypeScript rules
- Prettier for consistent formatting
- Run `npm run lint` to fix issues

### Git Hooks

Husky runs linting on commit:

- PHP files: Laravel Pint
- JS/TS/Vue files: ESLint + Prettier

## Contributing

1. Follow existing code conventions
2. Write tests for new features
3. Run linting before committing
4. Use descriptive commit messages
5. Update documentation as needed

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
