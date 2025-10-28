FROM node:18-alpine AS frontend-build

WORKDIR /app

# ⚠️ Copier depuis le sous-dossier
COPY miam_miam/package*.json ./
RUN npm ci

COPY miam_miam/ .
RUN npm run build

FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    libzip-dev \
    nginx \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    pdo \
    pdo_pgsql \
    pgsql \
    gd \
    zip \
    bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ⚠️ Copier depuis le sous-dossier
COPY miam_miam/ .

COPY --from=frontend-build /app/public/build /var/www/html/public/build

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# ⚠️ Copier depuis le sous-dossier
COPY miam_miam/docker/nginx/default.conf /etc/nginx/http.d/default.conf
COPY miam_miam/docker/supervisor/supervisord.conf /etc/supervisord.conf
COPY miam_miam/docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

CMD ["/start.sh"]
