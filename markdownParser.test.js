// file: markdownParser.test.js
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import markdownlint from 'markdownlint';
import MarkdownIt from 'markdown-it';
import './utility/llmMatcher'

const md = new MarkdownIt();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to count the level-2 headers in a Markdown string
const countLevel2Headers = (markdownContent) => {
  const tokens = md.parse(markdownContent, {});
  return tokens.filter(token => token.type === 'heading_open' && token.tag === 'h2').length;
}

const validateLevel2Headers = (markdownContent) => {
  const tokens = md.parse(markdownContent, {});
  const level2Headers = tokens.filter(token => token.type === 'heading_open' && token.tag === 'h2');

  // Regular expression to match the format "Step [0-9]+"
  const stepFormat = /^Step [0-9]+$/;

  // Check each level-2 header against the regular expression
  return level2Headers.every(header => {
    const nextToken = tokens[tokens.indexOf(header) + 1];
    return stepFormat.test(nextToken.content.trim());
  });
}

const steps = (markdownContent) => {
  // Split content based on the pattern ## Step followed by any number
  // We use a positive lookahead to keep the delimiter (## Step N) at the start of each resulting split element
  const steps = markdownContent.split(/(?=## Step \d+)/g);

  // Filter out any elements that don't start with "## Step" to exclude non-step elements
  // and remove the "## Step N" line from each step's content
  return steps
    .filter(step => step.trim().startsWith('## Step'))
    .map(step => step.replace(/^## Step \d+\n/, '').trim());
};

let filesToProcess = process.env.MARKDOWN_FILES_PATH.split(" ");
if (filesToProcess[0] === "all") {
  const directoryPath = path.join(__dirname, 'education/learning-objectives');
  filesToProcess = glob.sync(`${directoryPath}/**/*.md`);
}

console.log(filesToProcess);
// Load the Markdown content from a file
filesToProcess.forEach(filePath => {
  if (!filePath) {
    throw new Error('MARKDOWN_FILES_PATH environment variable is not set.');
  }
  // Jest test
  describe(`Markdown parsing for ${filePath}`, () => {
    const markdownContent = fs.readFileSync(filePath, 'utf8');
    test('lint Markdown content with markdownlint', (done) => {
      const options = {
        "files": [filePath],
        "config": {
          "default": true,
          "MD013": false,
          "MD033": false
        }
      };

      markdownlint(options, function (err, result) {
        if (err) {
          done(err);
        } else {
          const resultString = result.toString();
          if (resultString) {
            console.error(resultString);
          }
          expect(resultString).toBe('');
          done();
        }
      });
    });

    test('matches the number of level-2 headers with expected count', () => {

      // Count how many times "##" appears in the content (as an approximation)
      const manualCount = (markdownContent.match(/## /g) || []).length;
      // Use markdown-it to count level-2 headers
      const parsedCount = countLevel2Headers(markdownContent);
      // Expect the counts to match
      expect(parsedCount).toEqual(manualCount);
    });

    test('check that the headers are in the correct format', () => {
      const isValid = validateLevel2Headers(markdownContent);

      expect(isValid).toBe(true);
    });

    describe('Each step is the correct format', () => {
      const allSteps = steps(markdownContent);
      allSteps.forEach((stepContent, index) => {
        describe(`Step ${index + 1}`, () => {
          test(`Starts with something to "Say:" tag`, () => {
            expect(stepContent.startsWith('Say:')).toBe(true);
          });

          if (stepContent.includes('(Visual Aid:')) {
            test(`The "Visual Aid:" tag is in the right format`, () => {
              const visualAidFormat = /\(Visual Aid: .+\)/;
              expect(visualAidFormat.test(stepContent)).toBe(true);
            })
          };

          if (stepContent.includes('(Write:')) {
            test(`The "Write:" tag is in the right format`, () => {
              const visualAidFormat = /\(Write: [^@]+\s@\s.*\)/;
              expect(visualAidFormat.test(stepContent)).toBe(true);
            })
          };

          if (stepContent.includes('(Correct Answer:')) {
            test(`The "Correct Answer:" tag is in the right format`, () => {
              const correctAnswerFormat = /\(Correct Answer: .+\)/;
              expect(correctAnswerFormat.test(stepContent)).toBe(true);
            })

            test.concurrent(`The "Correct Answer:" tag includes an actual correct answer`, async () => {
              await expect(stepContent).toHaveTheCorrectAnswer()
            }, 30000)
          };

          if (stepContent.includes('(Common Misconceptions:')) {
            test(`The "Common Misconceptions:" tag is in the right format`, () => {
              const correctAnswerFormat = /\(Common Misconceptions: .+\)/;
              expect(correctAnswerFormat.test(stepContent)).toBe(true);
            })
          }

          if (stepContent.includes('(Support Slide:')) {
            test(`The "Support Slide:" tag is in the right format`, () => {
              const supportSlideFormat = /\(Support Slide: \d+\)/;
              expect(supportSlideFormat.test(stepContent)).toBe(true);
            })
          };

          if (stepContent.includes('(Support Question:')) {
            test(`The "Support Question:" tag is in the right format:`, () => {
              const supportSlideFormat = /\(Support Question: .+\)/;
              expect(supportSlideFormat.test(stepContent)).toBe(true);
            })
          };

          if (stepContent.includes('(Next Slide:')) {
            test(`The "Next Slide:" tag is in the right format`, () => {
              const nextSlideFormat = /\(Next Slide: \d+\)/;
              expect(nextSlideFormat.test(stepContent)).toBe(true);
            })
          };

          test('Contains no unexpected tags', () => {
            // Assume tags are enclosed in parentheses and follow the pattern: "(TagName: content)"
            // Split content by parentheses to find potential tags
            const potentialTags = stepContent.match(/\(([^:]+:)/g) || [];

            const cleanedTags = potentialTags.map(tag => tag.slice(1, -1) + ':');

            const expectedTags = ['Visual Aid:', 'Correct Answer:', 'Common Misconceptions:', 'Support Slide:', 'Next Slide:', 'Support Question:', 'Write:'];
            
            const unexpectedTags = cleanedTags.filter(tag => !expectedTags.includes(tag.trim()));

            expect(unexpectedTags.join(",")).toBe("");
          });
        });
      });
    });
  });
});