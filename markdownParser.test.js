// file: markdownParser.test.js
import fs from 'fs';
import markdownlint from 'markdownlint';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

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

// Load the Markdown content from a file
process.env.MARKDOWN_FILES_PATH.split(" ").forEach(filePath => {
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

          test(`Has an optional "Visual Aid:" tag`, () => {
            if (stepContent.includes('(Visual Aid:')) {
              const visualAidFormat = /\(Visual Aid: .+\)/;
              expect(visualAidFormat.test(stepContent)).toBe(true);
            } else {
              expect(true).toBe(true); // Pass if no Visual Aid tag is present
            }
          });

          test(`Has an optional "Correct Answer:" tag`, () => {
            if (stepContent.includes('(Correct Answer:')) {
              const correctAnswerFormat = /\(Correct Answer: .+\)/;
              expect(correctAnswerFormat.test(stepContent)).toBe(true);
            } else {
              expect(true).toBe(true); // Pass if no Correct Answer tag is present
            }
          });

          test(`Has an optional "Support Slide: tag":`, () => {
            if (stepContent.includes('(Support Slide:')) {
              const supportSlideFormat = /\(Support Slide: \d+\)/;
              expect(supportSlideFormat.test(stepContent)).toBe(true);
            } else {
              expect(true).toBe(true); // Pass if no Support Slide tag is present
            }
          });

          test(`Has an optional "Support Question: tag":`, () => {
            if (stepContent.includes('(Support Question:')) {
              const supportSlideFormat = /\(Support Question: .+\)/;
              expect(supportSlideFormat.test(stepContent)).toBe(true);
            } else {
              expect(true).toBe(true); // Pass if no Support Slide tag is present
            }
          });

          test(`Has an optional "Next Slide: tag":`, () => {
            if (stepContent.includes('(Next Slide:')) {
              const nextSlideFormat = /\(Next Slide: \d+\)/;
              expect(nextSlideFormat.test(stepContent)).toBe(true);
            } else {
              expect(true).toBe(true); // Pass if no Next Slide tag is present
            }
          });

          test('Contains no unexpected tags', () => {
            // Assume tags are enclosed in parentheses and follow the pattern: "(TagName: content)"
            // Split content by parentheses to find potential tags
            const potentialTags = stepContent.match(/\(([^:]+:)/g) || [];

            const cleanedTags = potentialTags.map(tag => tag.slice(1, -1) + ':');

            const expectedTags = ['Visual Aid:', 'Correct Answer:', 'Support Slide:', 'Next Slide:', 'Support Question:'];
            
            const unexpectedTags = cleanedTags.filter(tag => !expectedTags.includes(tag.trim()));

            expect(unexpectedTags.join(",")).toBe("");
          });
        });
      });
    });
  });
});