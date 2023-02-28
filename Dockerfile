FROM registry.access.redhat.com/ubi8/ubi-minimal:8.7 AS release

WORKDIR /app

RUN set -xe; \
    \
    echo "==> Installing postgres repo"; \
    rpm --import https://yum.postgresql.org/RPM-GPG-KEY-PGDG-94; \
    curl -s0 -o postgresql-repo.rpm https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm; \
    rpm -i postgresql-repo.rpm; \
    rm -f postgresql-repo.rpm; \
    \
    echo "==> Installing nodejs repo"; \
    microdnf module enable nodejs:18; \
    \
    echo "==> Installing packages"; \
    microdnf update; \
    microdnf install -y --nodocs postgresql15 nodejs; \
    \
    echo "==> Cleanup"; \
    microdnf clean all;

COPY . /app

RUN set -xe; \
    corepack enable; \
    pnpm install --frozen-lockfile --prod;

CMD node start.mjs operator-start
