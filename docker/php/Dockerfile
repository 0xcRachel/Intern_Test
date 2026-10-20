FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    zip \
    unzip \
    git \
    curl \
    libzip-dev \
    openssl-dev \
    linux-headers \
    autoconf \
    g++ \
    make

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        gd \
        zip \
        bcmath \
        pcntl

RUN pecl install mongodb \
    && docker-php-ext-enable mongodb

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/php/performance.ini /usr/local/etc/php/conf.d/zz-performance.ini
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
