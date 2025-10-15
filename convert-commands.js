/**
 * enrich-command-descriptions.js
 * ------------------------------------------
 * Reads an existing Git training JSON file,
 * populates each `commands[].description`
 * with a concise explanation of what that
 * CLI command actually does.
 *
 * Usage:
 *   node enrich-command-descriptions.js
 */

const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'public', 'json', 'new-content.json');
const INPUT_FILE = directory; // your current file
const OUTPUT_FILE = directory; // where the enriched file will go

// dictionary of known Git command explanations
const commandDescriptions = {
  'git config': 'Sets configuration values such as username, email, and editor preferences.',
  'git status': 'Shows the state of the working directory and staging area.',
  'git add': 'Stages file changes to be included in the next commit.',
  'git commit': 'Creates a new commit containing staged changes with a message.',
  'git log': 'Displays commit history for the current branch.',
  'git diff': 'Shows line-by-line differences between changes and the last commit.',
  'git branch': 'Lists, creates, renames, or deletes branches.',
  'git checkout': 'Switches branches or restores working tree files.',
  'git switch': 'Alternative to checkout for switching branches safely.',
  'git merge': 'Combines changes from one branch into another.',
  'git restore': 'Restores modified files to a previous state from the last commit.',
  'git reset': 'Moves HEAD and optionally modifies the index or working directory.',
  'git revert': 'Creates a new commit that undoes the effects of a previous commit.',
  'git clone': 'Copies a remote repository to a new local directory including history.',
  'git push': 'Uploads local commits to a remote repository.',
  'git pull': 'Fetches and merges new commits from the remote repository.',
  'git fetch': 'Downloads commits and updates remote references without merging.',
  'git fetch --prune': 'Removes local references to remote branches that no longer exist.',
  'git remote': 'Manages tracked repository connections (add, remove, list, or inspect).',
  'git remote -v': 'Shows remote names with their fetch/push URLs.',
  'git remote show origin': "Displays details about the 'origin' remote and tracked branches.",
  'git init': 'Initializes a new Git repository in the current directory.',
  'git clean': 'Deletes untracked files and directories from the working tree.',
  'git tag': 'Lists, creates, deletes, or verifies tags used for marking versions.',
  'git stash': 'Temporarily saves local modifications for later restoration.',
  'git stash pop': 'Restores the most recently stashed changes and removes them from stash list.',
  'git blame': 'Shows which commit and author last modified each line of a file.',
  'git show': 'Displays details about objects such as commits or tags.',
  'git remote add': 'Adds a new remote connection by name and URL.',
  'git remote remove': 'Removes an existing remote repository from configuration.',
  'git fetch origin': "Fetches updates specifically from the remote named 'origin'.",
  'git push origin': "Pushes commits to the specified branch on the 'origin' remote.",
  'git pull origin': "Pulls and merges changes from the specified branch on the 'origin' remote.",
  'git branch -d': 'Deletes a local branch that has been merged into another.',
  'git branch -D': 'Forcibly deletes a local branch regardless of merge status.',
  'git config --global user.name': 'Sets your global Git username used for all repositories.',
  'git config --global user.email': 'Sets your global Git email address for all repositories.',
};

/**
 * Match a git command string to the best
 * known description above.
 */
function findDescription(action) {
  if (!action || typeof action !== 'string') return '';
  const cleaned = action.trim();
  // find the best matching key (longest matching prefix)
  const match = Object.keys(commandDescriptions)
    .filter((k) => cleaned.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return match ? commandDescriptions[match] : 'Executes a Git operation.';
}

/**
 * Recursively walk the training JSON and
 * fill in missing command descriptions.
 */
function enrich(obj) {
  if (Array.isArray(obj)) return obj.map(enrich);
  if (obj && typeof obj === 'object') {
    const result = { ...obj };
    if (result.commands && Array.isArray(result.commands)) {
      result.commands = result.commands.map((cmd) => ({
        ...cmd,
        description: cmd.description || findDescription(cmd.action),
      }));
    }
    if (Array.isArray(result.items)) result.items = result.items.map(enrich);
    return result;
  }
  return obj;
}

try {
  const json = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const enriched = enrich(json);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enriched, null, 2), 'utf-8');
  console.log(`✅ Enrichment complete! Saved to: ${OUTPUT_FILE}`);
} catch (err) {
  console.error('❌ Error:', err.message);
}
