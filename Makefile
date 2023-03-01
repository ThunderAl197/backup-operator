MAKEARGS += -j3
DOCKER = docker

COMMIT_HASH = $(shell git rev-parse --short HEAD)
CONTAINER_REPO = thunderal/backup-operator
CONTAINER_IMAGE = $(CONTAINER_REPO):$(COMMIT_HASH)
CONTAINER_IMAGE_LATEST = $(CONTAINER_REPO):$(COMMIT_HASH)

container-build:
	$(DOCKER) build . \
		--progress=plain \
		-f ./Dockerfile \
		-t "$(CONTAINER_IMAGE)"

container-info:
	dive --ci "$(CONTAINER_IMAGE)" || true

container-publish: container-build container-info
	$(DOCKER) push "$(CONTAINER_IMAGE)"

container-publish-latest: container-build container-info
	$(DOCKER) tag "$(CONTAINER_IMAGE)" "$(CONTAINER_IMAGE_LATEST)"
	$(DOCKER) push "$(CONTAINER_IMAGE_LATEST)"

container-publish-all: container-publish container-publish-latest

container-run: container-build
	$(DOCKER) run -it --rm "$(CONTAINER_IMAGE)"

clean:
	rm -rf ./data ./node_modules
