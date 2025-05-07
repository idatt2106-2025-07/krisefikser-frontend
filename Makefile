.PHONY: setup-hosts

setup-hosts:
	@echo "Adding dev.krisefikser.com to /etc/hosts..."
	@echo "127.0.0.1 dev.krisefikser.com" | sudo tee -a /etc/hosts
