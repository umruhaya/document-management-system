# Document Management System

## Getting Started

1. Install [Bun.js](https://bun.sh/)

2. Install Packages using `bun`:

```bash
cd server
bun install
```

3. Start the development server:

```bash
bun dev
```

## Contributuing Guide

### Consistent Formatting

According to this [Article](https://graphite.dev/guides/how-to-resolve-merge-conflicts-in-git#best-practices-for-handling-merge-conflicts) Most of the Merge conflicts arise from inconsistent formatting styles.

For this specific project, `.vscode` and `dprint.json` are setup and the purpose of this is to have consistent formatting across different environment for all contributers. For example, Dprint Formatter settings in this project does not allow semicolons at end of lines for `js/ts` files and add trailing commas. These changes take should take effect `On File Save`. However, if they dont you need to configure Dprint Formatter correctly on your system. For this project, I assume you are using vscode so `.vscode` defaults should work but if you use any other editor you should configure Dprint Formatter with it as well. It is your responsibility to configure your local dev environment correctly work with the formatting Guidelines for this project. See `dprint.json`.

#### Install Dprint formatter

Install using one of the methods below.

Shell (Mac, Linux, WSL):

```bash
curl -fsSL https://dprint.dev/install.sh | sh
```

Windows Installer
Powershell (Windows):

```bash
iwr https://dprint.dev/install.ps1 -useb | iex
```

Scoop (Windows):

```bash
scoop install dprint
```

Homebrew (Mac):

```bash
brew install dprint
```