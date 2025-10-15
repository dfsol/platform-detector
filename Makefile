.PHONY: set-gh-vars

include .env
export

set-gh-vars:
	echo ${GHP_AUTH_TOKEN} | gh secret set GHP_AUTH_TOKEN
	echo ${NPMJS_AUTH_TOKEN} | gh secret set NPMJS_AUTH_TOKEN
