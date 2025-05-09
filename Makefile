.PHONY: setup-hosts

setup-hosts:
	@echo "Adding dev.krisefikser.localhost to /etc/hosts..."
	@echo "127.0.0.1 dev.krisefikser.localhost" | sudo tee -a /etc/hosts
