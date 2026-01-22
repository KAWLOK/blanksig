# CLAUDE.md - AI Assistant Guide for blanksig

**Repository**: KAWLOK/blanksig
**Last Updated**: 2026-01-22
**Status**: New Repository - Initial Setup Phase

---

## Table of Contents

1. [Repository Overview](#repository-overview)
2. [Current State](#current-state)
3. [Development Workflow](#development-workflow)
4. [Code Conventions](#code-conventions)
5. [Git Workflow](#git-workflow)
6. [Testing Guidelines](#testing-guidelines)
7. [Documentation Standards](#documentation-standards)
8. [AI Assistant Guidelines](#ai-assistant-guidelines)
9. [Common Tasks](#common-tasks)
10. [Troubleshooting](#troubleshooting)

---

## Repository Overview

### Project Purpose
*To be defined as the project evolves*

This repository is currently in its initial setup phase. The following sections will be updated as the codebase develops.

### Technology Stack
*To be defined based on first commits*

Common possibilities to watch for:
- **Language**: Python, JavaScript/TypeScript, Go, Rust, etc.
- **Framework**: React, Vue, Django, Flask, Express, etc.
- **Build Tools**: webpack, vite, cargo, make, etc.
- **Package Manager**: npm, yarn, pnpm, pip, poetry, cargo, etc.

### Project Structure
```
blanksig/
├── .git/                 # Git version control
└── CLAUDE.md            # This file - AI assistant guide
```

*This structure will be updated as the project grows*

---

## Current State

### Repository Status
- **Initial State**: Empty repository, no commits yet
- **Branch**: `claude/claude-md-mkpt5ieob2q0ibpc-1U17O`
- **Remote**: origin at http://127.0.0.1:17838/git/KAWLOK/blanksig

### Next Steps for Development
1. Define project purpose and technology stack
2. Initialize project structure (package.json, requirements.txt, Cargo.toml, etc.)
3. Set up development environment and tooling
4. Create initial documentation (README.md)
5. Implement core functionality
6. Set up testing framework
7. Configure CI/CD pipelines

---

## Development Workflow

### Branch Naming Convention
- **Feature branches**: `claude/<descriptive-name>-<session-id>`
- **Main branch**: To be determined (likely `main` or `master`)
- **CRITICAL**: Branch names MUST start with `claude/` and end with session ID for successful push operations

### Before Starting Work
1. Check current branch: `git status`
2. Ensure you're on the correct feature branch
3. Review recent changes: `git log --oneline -10`
4. Check for uncommitted changes

### Making Changes
1. **Read Before Modifying**: Always read files before making changes
2. **Understand Context**: Review related files to understand dependencies
3. **Make Focused Changes**: Keep changes minimal and directly related to the task
4. **Test Your Changes**: Verify functionality after modifications
5. **Commit Regularly**: Make small, logical commits with clear messages

---

## Code Conventions

### General Principles
- **Simplicity First**: Avoid over-engineering; solve the immediate problem
- **No Premature Optimization**: Only optimize when there's a proven need
- **Minimal Abstractions**: Don't create utilities or helpers for one-time operations
- **Security Awareness**: Watch for vulnerabilities (XSS, SQL injection, command injection, etc.)
- **Clean Up Unused Code**: Delete, don't comment out or rename with `_`

### Code Style
*To be defined based on project language and team preferences*

**When the project initializes, update this section with:**
- Indentation style (spaces vs tabs, 2 vs 4 spaces)
- Naming conventions (camelCase, snake_case, PascalCase)
- Comment style and documentation requirements
- File organization patterns
- Import/require ordering

### Documentation in Code
- **Only Add When Necessary**: Don't add comments to code you didn't change
- **Self-Documenting Code**: Prefer clear naming over comments
- **Comment the Why, Not the What**: Explain reasoning, not obvious operations
- **Keep Comments Updated**: Remove outdated comments immediately

---

## Git Workflow

### Commit Message Format
```
<type>: <brief description>

<optional detailed description>

<optional references to issues/tickets>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring without behavior change
- `docs`: Documentation only changes
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, tooling
- `perf`: Performance improvements

### Commit Guidelines
1. **Use Descriptive Messages**: Focus on the "why" not just the "what"
2. **Keep Commits Focused**: One logical change per commit
3. **Follow Repository Style**: Review `git log` to match existing patterns
4. **Never Commit Secrets**: Check for .env, credentials, API keys before committing

### Push Operations
```bash
# Always use -u flag for new branches
git push -u origin <branch-name>

# Branch MUST start with 'claude/' and end with session ID
# Retry up to 4 times with exponential backoff if network errors occur
```

### Fetch/Pull Operations
```bash
# Prefer specific branches
git fetch origin <branch-name>
git pull origin <branch-name>

# Retry up to 4 times with exponential backoff if network errors occur
```

### Git Safety Rules
- ❌ **NEVER** update git config without explicit permission
- ❌ **NEVER** run destructive commands (force push, hard reset) without explicit user request
- ❌ **NEVER** skip hooks (--no-verify, --no-gpg-sign) without explicit request
- ❌ **NEVER** force push to main/master
- ⚠️ **AVOID** `git commit --amend` unless specific conditions are met:
  - User explicitly requested amend, OR pre-commit hook auto-modified files
  - HEAD commit was created by you in this conversation
  - Commit has NOT been pushed to remote
- ✅ **ALWAYS** verify status before and after operations
- ✅ **ALWAYS** use proper quoting for paths with spaces

---

## Testing Guidelines

### Testing Philosophy
*To be defined when test framework is established*

### Running Tests
```bash
# Commands to be added based on testing framework
# Examples:
# npm test
# pytest
# cargo test
# go test ./...
```

### Writing Tests
*Guidelines to be added based on testing framework and conventions*

---

## Documentation Standards

### README.md
*To be created - should include:*
- Project description and purpose
- Installation instructions
- Usage examples
- Contributing guidelines
- License information

### Code Documentation
- Document public APIs and interfaces
- Include examples for complex functionality
- Keep documentation close to the code it describes

### This File (CLAUDE.md)
- **Update Regularly**: Keep this file current as the project evolves
- **Be Specific**: Add concrete examples and commands
- **Stay Relevant**: Remove outdated information promptly

---

## AI Assistant Guidelines

### Tool Usage Priorities
1. **Use Specialized Tools**: Prefer Read/Edit/Write over bash for file operations
2. **Search Efficiently**: Use Task tool with Explore agent for codebase exploration
3. **Parallel Operations**: Call multiple independent tools simultaneously
4. **Avoid Bash for Communication**: Never use echo or comments to communicate with users

### Task Management
1. **Use TodoWrite**: For multi-step or complex tasks (3+ steps)
2. **Update Status Real-Time**: Mark tasks in_progress before starting
3. **Complete Immediately**: Mark tasks completed as soon as finished
4. **One Task at a Time**: Only one task should be in_progress at any moment

### Reading Code
- ✅ **Always read files before modifying them**
- ✅ **Use Read tool for specific files**
- ✅ **Use Glob for finding files by pattern**
- ✅ **Use Grep for content search**
- ✅ **Use Task/Explore for broad codebase exploration**

### Making Changes
- ✅ **Minimal changes**: Only modify what's necessary
- ✅ **Security first**: Check for vulnerabilities in new code
- ✅ **Test after changes**: Verify functionality
- ❌ **No feature creep**: Don't add unrequested features
- ❌ **No unnecessary refactoring**: Don't "improve" working code unless asked
- ❌ **No premature abstraction**: Keep it simple

### Communication Style
- **Concise**: Users see CLI output; be brief and clear
- **No Emojis**: Unless explicitly requested by user
- **Professional**: Focus on facts, not validation
- **Markdown**: Use GitHub-flavored markdown for formatting
- **No Colons Before Tools**: End sentences with periods

---

## Common Tasks

### Initial Project Setup
```bash
# Example for Node.js project
npm init -y
npm install <dependencies>

# Example for Python project
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Example for Rust project
cargo init
cargo build
```

### Adding Dependencies
*To be updated based on project type*

### Running the Project
*To be updated with specific commands*

### Building for Production
*To be updated with build process*

---

## Troubleshooting

### Git Push Fails with 403
- **Cause**: Branch name doesn't start with `claude/` or doesn't end with session ID
- **Solution**: Ensure branch name follows pattern: `claude/<name>-<session-id>`

### Network Errors on Git Operations
- **Solution**: Implement exponential backoff retry (2s, 4s, 8s, 16s)
- **Max Retries**: 4 attempts

### File Not Found Errors
- **Check**: Current working directory with `pwd`
- **Check**: File exists with `ls -la <path>`
- **Remember**: Always use absolute paths in tools

### Merge Conflicts
*To be updated when collaboration patterns are established*

---

## Project-Specific Notes

### Current Session
- **Branch**: `claude/claude-md-mkpt5ieob2q0ibpc-1U17O`
- **Task**: Initial repository analysis and CLAUDE.md creation
- **Status**: New repository, first commit will initialize the project

### Future Updates Needed
As the project develops, update the following sections:
1. [ ] Define project purpose and goals
2. [ ] Document technology stack and dependencies
3. [ ] Add installation and setup instructions
4. [ ] Document API endpoints or CLI commands
5. [ ] Add testing procedures and examples
6. [ ] Document deployment process
7. [ ] Add troubleshooting for project-specific issues
8. [ ] Include environment variable requirements
9. [ ] Document any external service dependencies

---

## Maintenance

### Updating This File
- **Frequency**: Update whenever significant project changes occur
- **Responsibility**: All AI assistants should maintain this file
- **Format**: Keep structure consistent and sections organized
- **Version**: Update "Last Updated" date at the top

### Review Checklist
- [ ] All commands are tested and working
- [ ] File paths are accurate
- [ ] Conventions match current codebase
- [ ] Examples are relevant and helpful
- [ ] Removed outdated information
- [ ] Added new patterns discovered in the codebase

---

## Additional Resources

### Related Documentation
*Links to be added as documentation is created:*
- README.md
- CONTRIBUTING.md
- API Documentation
- Architecture Decision Records (ADRs)

### External References
*Project-specific external resources to be added*

---

**Remember**: This is a living document. Keep it updated as the repository evolves, and it will serve as an invaluable guide for AI assistants working on this project.
