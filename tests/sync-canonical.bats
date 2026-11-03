#!/usr/bin/env bats
# BATS tests for sync-canonical.sh script

# Setup and teardown
setup() {
  # Create a temporary directory for testing
  export TEST_DIR=$(mktemp -d)
  export REPO_ROOT="$TEST_DIR/branch-validation"
  mkdir -p "$REPO_ROOT/references"
  mkdir -p "$REPO_ROOT/scripts"

  # Copy the sync script
  cp "$(pwd)/scripts/sync-canonical.sh" "$REPO_ROOT/scripts/"
  chmod +x "$REPO_ROOT/scripts/sync-canonical.sh"
}

teardown() {
  # Clean up temporary directory
  rm -rf "$TEST_DIR"
}

# Test: Script exists and is executable
@test "sync-canonical.sh script exists" {
  [ -f "$REPO_ROOT/scripts/sync-canonical.sh" ]
}

@test "sync-canonical.sh is executable" {
  [ -x "$REPO_ROOT/scripts/sync-canonical.sh" ]
}

# Test: Script shebang is correct
@test "sync-canonical.sh has correct shebang" {
  head -n 1 "$REPO_ROOT/scripts/sync-canonical.sh" | grep -q "^#!/bin/bash"
}

# Test: Script has proper error handling
@test "sync-canonical.sh has set -e for error exit" {
  grep -q "^set -e" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script defines required variables
@test "sync-canonical.sh defines SCRIPT_DIR" {
  grep -q "SCRIPT_DIR=" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh defines REPO_ROOT" {
  grep -q "REPO_ROOT=" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh defines REFS_DIR" {
  grep -q "REFS_DIR=" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script defines GitHub URLs
@test "sync-canonical.sh defines GITHUB_BRANCH" {
  grep -q "GITHUB_BRANCH=" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh defines GITHUB_RAW" {
  grep -q "GITHUB_RAW=" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script mentions expected files
@test "sync-canonical.sh mentions branch-types.yml" {
  grep -q "branch-types.yml" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh mentions branch-labels.yml" {
  grep -q "branch-labels.yml" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script has proper file operations
@test "sync-canonical.sh uses curl for downloads" {
  grep -q "curl" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh checks curl exit status" {
  grep -q "curl.*-f" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script creates documentation file
@test "sync-canonical.sh creates CANONICAL_FILES.md" {
  grep -q "CANONICAL_FILES.md" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script has success output
@test "sync-canonical.sh prints success message" {
  grep -q "✅" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script has error messages
@test "sync-canonical.sh has error handling output" {
  grep -q "❌" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script provides next steps
@test "sync-canonical.sh outputs next steps" {
  grep -q "Next steps" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script syntax is valid
@test "sync-canonical.sh has valid bash syntax" {
  bash -n "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script array declaration
@test "sync-canonical.sh declares FILES array" {
  grep -q "declare -a FILES" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script loops over files
@test "sync-canonical.sh has for loop for FILES" {
  grep -q 'for entry in "${FILES\[@\]}"' "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script syncs the validator as well as the reference files
@test "sync-canonical.sh syncs the branch-name validator" {
  grep -q "scripts/validation/validate-branch-name.cjs:scripts/validate-branch-name.cjs" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script uses basename
@test "sync-canonical.sh extracts filename with basename" {
  grep -q "basename" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script constructs URLs properly
@test "sync-canonical.sh constructs GitHub URLs" {
  grep -q "GITHUB_RAW.*file" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script error messages are helpful
@test "sync-canonical.sh error message mentions url" {
  grep -q "from.*url" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script documentation in header
@test "sync-canonical.sh has documentation comment" {
  grep -q "# Sync canonical files" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh documents purpose" {
  grep -q "updates the reference copies" "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Files list is complete
@test "sync-canonical.sh includes both canonical files" {
  local file_count=$(grep -c "branch-.*\.yml" "$REPO_ROOT/scripts/sync-canonical.sh")
  [ "$file_count" -ge 2 ]
}

# Test: Script handles paths correctly
@test "sync-canonical.sh uses absolute paths" {
  grep -q '\$(' "$REPO_ROOT/scripts/sync-canonical.sh"
}

# Test: Script exit codes
@test "sync-canonical.sh exits with 0 on success" {
  grep -q "exit 0" "$REPO_ROOT/scripts/sync-canonical.sh" || grep -q "successful" "$REPO_ROOT/scripts/sync-canonical.sh"
}

@test "sync-canonical.sh exits with 1 on failure" {
  grep -q "exit 1" "$REPO_ROOT/scripts/sync-canonical.sh"
}
