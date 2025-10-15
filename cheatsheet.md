# Git Command Cheatsheet

This reference summarizes every major Git command covered in your training.  
Each section follows the same flow — from getting started, to collaborating with others effectively.

---

## 1. Setup & Configuration

Before using Git, configure your identity and preferences.  
Git records this information once and applies it automatically to all future projects.

```bash
# Set up your identity
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# Optional preferences
git config --global init.defaultBranch main
git config --global core.editor "code --wait"
git --version
git config --list
```

> Why it matters:  
> Every commit includes the name and email of the author.  
> Setting these once ensures all your work is correctly attributed.

---

## 2. Core Workflow – Working Locally

Git records snapshots of your project history instead of overwriting files.  
The basic loop is: edit files, stage relevant changes, commit them with context, and repeat.

```bash
# Check what changed
git status

# Stage files to include in the next commit
git add <file>
git add .               # Stage all modified files

# Save a snapshot with a descriptive message
git commit -m "Write a short but meaningful message"

# Review history or examine differences
git log --oneline
git diff
```

> Think of staging as deciding which parts of your draft are ready to be published.

---

## 3. Branching – Develop Features in Isolation

Branches let you experiment or fix issues without disrupting the work of others.  
Each branch is its own timeline that can later be merged back into the main project.

```bash
git branch                       # List all local branches
git branch -r                    # List remote branches
git checkout -b feature-1        # Create and switch to a new branch
git switch <branch>              # Alternative to checkout
git merge feature-1              # Combine branch into the current branch
git branch -d feature-1          # Delete a branch after merging
```

> Use one branch per feature or fix. It keeps changes clear and isolated.

---

## 4. Working with Remotes – Sharing Projects

Your local repository is private until you connect it to a remote one.  
Remotes, such as Azure DevOps, act as centralized storage for collaboration, backup, and deployment.

```bash
git remote add origin https://dev.azure.com/<org>/<project>/_git/<repo>   # Link to remote repository
git remote -v                                                             # Confirm connections
git push -u origin main                                                   # Push local commits and set tracking
git pull origin main                                                      # Get the latest version from remote
git fetch origin                                                          # Download updates without merging
git fetch --prune                                                         # Remove outdated remote references
git clone https://dev.azure.com/<org>/<project>/_git/<repo>               # Copy an existing project
```

> Always update before you push. This ensures your work builds on the latest version of the project.

---

## 5. Collaboration – Using Azure DevOps

Azure DevOps provides a visual layer for Git.  
From there, you can view commits, branches, Pull Requests, and work items all in one place.

Typical flow:

1. Create or open a repository in **Repos → Files**.
2. Copy the repository URL.
3. Link it with `git remote add` or clone it directly.
4. Push commits so others can see your work.
5. Verify changes in **Repos → Files**.

> The Sync Changes button in Visual Studio Code Source Control performs both pull and push in one click.

---

## 6. Pull Requests – Reviewing Before Merging

Pull Requests (PRs) allow developers to propose changes for review before merging into the main branch.  
They bring communication and approval into the development process.

**In Azure DevOps:**

1. Go to **Repos → Pull Requests → New Pull Request**.
2. Choose your feature branch as the source and `main` as the target.
3. Write a short title and brief description.
4. Add reviewers and create the PR.
5. Reviewers can discuss, approve, or request modifications.
6. Complete and merge once approved.

After merging, clean up branches:

```bash
git branch -d feature-1
git push origin --delete feature-1
```

> Keep Pull Requests focused and concise so teammates can review them efficiently.

---

## 7. Undo and Recovery

Errors happen. Git provides several ways to back out gracefully without losing work permanently.

```bash
git restore <file>                # Discard local modifications to a file
git reset --soft HEAD~1           # Undo last commit but keep changes staged
git reset --hard HEAD~1           # Undo last commit and discard changes
git revert <commit>               # Safely create a new commit that undoes a previous one
git clean -fd                     # Remove untracked files and directories
```

> Start with safe options like `restore` or `revert`.  
> Only use `reset --hard` when you are certain you no longer need those changes.

---

## 8. Reviewing History

Every commit represents a milestone.  
Inspecting history helps trace progress or find where an issue was introduced.

```bash
git log --graph --oneline --all --decorate   # Visual timeline of your branches
git show <commit>                            # View details about a specific commit
git blame <file>                             # Show who last modified each line
```

> `git log --graph` can be your compass when understanding how branches merge over time.

---

## 9. Daily Collaboration Routine

A practical rhythm for everyday work in teams:

1. Pull the latest updates.
2. Create or switch to your branch.
3. Edit, stage, and commit changes.
4. Push your branch to the remote.
5. Open a Pull Request for feedback.
6. Merge after approval and delete stale branches.

Example sequence:

```bash
git pull origin main
git checkout -b new-feature
# make edits...
git add .
git commit -m "Implement new feature"
git push -u origin new-feature
```

> This routine keeps everyone working on the same foundation and reduces merge conflicts.

---

## 10. Useful Shortcuts

Commands that make daily maintenance and multitasking simpler.

```bash
git stash            # Temporarily store changes without committing
git stash pop        # Reapply stashed changes
git tag v1.0.0       # Label a specific commit as a version
git fetch --prune    # Remove deleted remote branches locally
```

> Stash is perfect for pausing unfinished work before switching tasks.

---

## Summary

Git captures every significant step of your project.  
Once you understand its flow—making changes, storing them, sharing them, and reviewing them—you can work confidently without fear of mistakes.

Use this cheatsheet as a map during your first months of daily Git use.  
Over time, these commands will become as natural as saving a file or pressing undo in your editor.

---
