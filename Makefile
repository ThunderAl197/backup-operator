DOCKER = docker

COMMIT_HASH = $(shell git rev-parse --short HEAD)
CONTAINER_REPO = thunderal/backup-operator
CONTAINER_IMAGE = $(CONTAINER_REPO):$(COMMIT_HASH)

container-build:
	$(DOCKER) build . \
		--progress=plain \
		-f ./Dockerfile \
		-t "$(CONTAINER_IMAGE)"

container-info: container-build
	dive --ci "$(CONTAINER_IMAGE)" || true

container-run: container-build
	$(DOCKER) run -it --rm "$(CONTAINER_IMAGE)"
