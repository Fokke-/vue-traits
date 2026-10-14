#!/usr/bin/env bash
# Checks that a pushed tag may be published and picks its npm dist-tag.
#
# Input (environment): TAG (e.g. v1.0.0-beta.1), SHA (the tagged commit).
# Output: `dist-tag=<tag>` appended to $GITHUB_OUTPUT.
#
# - The tag must be `v` + the version in package.json
# - A stable version must be on master; a prerelease on master or dev
# - The version must not be on npm yet
# - npm must support staged publishing
set -euo pipefail

: "${TAG:?TAG is not set}"
: "${SHA:?SHA is not set}"
: "${GITHUB_OUTPUT:?GITHUB_OUTPUT is not set}"

work_dir=$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/check-release.XXXXXX")
trap 'rm -rf "$work_dir"' EXIT

fail() {
  echo "::error::$1"
  exit 1
}

version=$(node -p "require('./package.json').version")
name=$(node -p "require('./package.json').name")

[[ "$TAG" == "v$version" ]] ||
  fail "Tag $TAG does not match the package.json version $version"

# Semver with an optional prerelease such as -beta.1; no build metadata
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-([a-z]+)\.[0-9]+)?$ ]] ||
  fail "Version $version is not of the form X.Y.Z or X.Y.Z-<name>.N"

on_branch() {
  git merge-base --is-ancestor "$SHA" "origin/$1" 2>/dev/null
}

if [[ -n "${BASH_REMATCH[2]}" ]]; then
  dist_tag="${BASH_REMATCH[2]}"
  on_branch master || on_branch dev ||
    fail "Prerelease $version must be tagged on master or dev"
else
  dist_tag=latest
  on_branch master || fail "Stable version $version must be tagged on master"
fi

# Prints the version if it is published, nothing if the package exists
# without it, and fails with E404 if the package doesn't exist at all. Any
# other failure (network, registry) stops the release instead of passing.
if published=$(npm view "$name@$version" version 2>"$work_dir/npm-view.log"); then
  [[ -z "$published" ]] || fail "$name@$version is already on npm"
elif ! grep -q E404 "$work_dir/npm-view.log"; then
  cat "$work_dir/npm-view.log" >&2
  fail "Could not check whether $name@$version is on npm"
fi

npm_version=$(npm --version)
node -e '
  const [a, b] = process.argv[1].split(".").map(Number)
  process.exit(a > 11 || (a === 11 && b >= 15) ? 0 : 1)
' "$npm_version" ||
  fail "npm $npm_version is too old for staged publishing (needs 11.15.0+)"

echo "Publishing $name@$version with dist-tag $dist_tag (npm $npm_version)"
echo "dist-tag=$dist_tag" >>"$GITHUB_OUTPUT"
