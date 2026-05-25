import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../config/env';
import { User, UserRole, AuthProvider } from '../models/User';
import { Lesson, LessonStatus } from '../models/Lesson';
import { QuestionSet } from '../models/QuestionSet';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(config.mongodbUri);
  console.log('Connected. Seeding database...');

  await User.deleteMany({});
  await Lesson.deleteMany({});
  await QuestionSet.deleteMany({});
  console.log('Cleared existing data.');

  const teacherPasswordHash = await bcrypt.hash('Teacher123!', SALT_ROUNDS);
  const studentPasswordHash = await bcrypt.hash('Student123!', SALT_ROUNDS);

  const teacher = await User.create({
    email: 'teacher@test.com',
    name: 'Sarah Cohen',
    passwordHash: teacherPasswordHash,
    role: UserRole.TEACHER,
    authProvider: AuthProvider.LOCAL,
  });

  const student = await User.create({
    email: 'student@test.com',
    name: 'David Levy',
    passwordHash: studentPasswordHash,
    role: UserRole.STUDENT,
    authProvider: AuthProvider.LOCAL,
  });

  console.log(`Created teacher: ${teacher.email} (${teacher._id})`);
  console.log(`Created student: ${student.email} (${student._id})`);

  const fractionsLesson = await Lesson.create({
    ownerTeacherId: teacher._id,
    title: 'Understanding Fractions',
    status: LessonStatus.PUBLISHED,
    content: `# Understanding Fractions

## What Is a Fraction?

A fraction represents a part of a whole. When we divide something into equal pieces, each piece is a fraction of the original. The number on top is called the **numerator** — it tells us how many parts we have. The number on the bottom is called the **denominator** — it tells us how many equal parts the whole was divided into. For example, in the fraction 3/4, the numerator is 3 and the denominator is 4, meaning we have three out of four equal parts.

## Types of Fractions

There are three main types of fractions you will encounter. **Proper fractions** have a numerator smaller than the denominator, like 2/5 or 7/8 — these represent a quantity less than one whole. **Improper fractions** have a numerator equal to or greater than the denominator, like 5/3 or 9/4 — these represent a quantity equal to or greater than one whole. **Mixed numbers** combine a whole number with a proper fraction, like 1 1/2 or 3 2/7. You can always convert between improper fractions and mixed numbers: to go from an improper fraction to a mixed number, divide the numerator by the denominator; the quotient is the whole part and the remainder goes over the original denominator.

## Equivalent Fractions

Two fractions are equivalent when they represent the same amount. You can create equivalent fractions by multiplying or dividing both the numerator and denominator by the same number. For instance, 1/2 is equivalent to 2/4, 3/6, and 50/100 because in each case we are describing exactly half. Finding equivalent fractions is the key to comparing fractions with different denominators and to simplifying fractions to their lowest terms.

## Adding and Subtracting Fractions

To add or subtract fractions, they must share a common denominator. If they already do, simply add or subtract the numerators and keep the denominator the same: 2/7 + 3/7 = 5/7. If the denominators are different, you first find the least common denominator (LCD), convert each fraction to an equivalent fraction with that LCD, then perform the operation. For example, to add 1/3 + 1/4, the LCD is 12, so we rewrite the problem as 4/12 + 3/12 = 7/12. Always simplify your final answer if possible.

## Fractions in Real Life

Fractions are everywhere in daily life. When you eat 2 slices out of an 8-slice pizza, you have eaten 2/8, or 1/4, of the pizza. Recipes use fractions constantly — "add 3/4 cup of flour" or "use 1/2 teaspoon of salt." Understanding fractions helps you split a bill evenly, measure ingredients, read a ruler, and reason about probabilities. Mastering fractions now builds a foundation for decimals, percentages, and algebra later on.`,
  });

  const decimalsLesson = await Lesson.create({
    ownerTeacherId: teacher._id,
    title: 'Introduction to Decimals',
    status: LessonStatus.DRAFT,
    content: `# Introduction to Decimals

## What Are Decimals?

A decimal is another way to represent parts of a whole, using a dot called the **decimal point**. The digits to the left of the decimal point represent whole numbers, while the digits to the right represent fractions of one. The first place to the right of the decimal point is the **tenths** place (1/10), the second is the **hundredths** place (1/100), and so on. For example, 3.25 means 3 wholes plus 2 tenths plus 5 hundredths, which is the same as 3 and 25/100, or 3 and 1/4.

## Place Value in Decimals

Understanding place value is essential for working with decimals. Each place is ten times the value of the place to its right. In the number 4.637, the 4 is in the ones place (worth 4), the 6 is in the tenths place (worth 0.6), the 3 is in the hundredths place (worth 0.03), and the 7 is in the thousandths place (worth 0.007). You can read 4.637 as "four and six hundred thirty-seven thousandths." Zeros after the last non-zero digit to the right of the decimal point do not change the value: 2.5 and 2.50 and 2.500 are all the same number.

## Comparing and Ordering Decimals

To compare decimals, start from the left and compare digits in the same place value position. Align the decimal points and add trailing zeros if needed so both numbers have the same number of decimal places. For example, comparing 0.7 and 0.65: rewrite 0.7 as 0.70, then compare — 70 hundredths is greater than 65 hundredths, so 0.7 > 0.65. This method works for ordering any set of decimals from least to greatest or greatest to least.

## Adding and Subtracting Decimals

Adding and subtracting decimals works just like adding and subtracting whole numbers, as long as you line up the decimal points vertically. Fill in any missing places with zeros, then add or subtract column by column from right to left, carrying or borrowing as needed. For example, 12.6 + 3.45 becomes 12.60 + 3.45 = 16.05. The decimal point in the answer goes directly below the decimal points in the problem. Double-check by estimating: 12.6 is about 13 and 3.45 is about 3, so the answer should be near 16 — and it is.

## Decimals and Fractions: Two Sides of the Same Coin

Every decimal can be written as a fraction and every fraction can be written as a decimal. To convert a decimal to a fraction, read the decimal using place value: 0.75 is "seventy-five hundredths," or 75/100, which simplifies to 3/4. To convert a fraction to a decimal, divide the numerator by the denominator: 3/8 = 0.375. Some fractions produce repeating decimals, like 1/3 = 0.333... Understanding this connection lets you move freely between the two representations and choose whichever is most convenient for the problem at hand.`,
  });

  console.log(`Created lesson: "${fractionsLesson.title}" (${fractionsLesson.status})`);
  console.log(`Created lesson: "${decimalsLesson.title}" (${decimalsLesson.status})`);

  const fractionsQuestionSet = await QuestionSet.create({
    lessonId: fractionsLesson._id,
    formatVersion: 1,
    questions: [
      {
        questionText: 'In the fraction 5/8, what does the number 8 represent?',
        options: [
          'The number of parts we have',
          'The number of equal parts the whole is divided into',
          'The total amount',
          'The remainder after division',
        ],
        correctAnswerIndex: 1,
        explanation:
          'The denominator (bottom number) tells us how many equal parts the whole has been divided into. In 5/8, the whole is divided into 8 equal parts.',
      },
      {
        questionText: 'Which of the following is an improper fraction?',
        options: ['3/7', '2/5', '9/4', '1/2'],
        correctAnswerIndex: 2,
        explanation:
          'An improper fraction has a numerator greater than or equal to its denominator. 9/4 has a numerator (9) larger than its denominator (4).',
      },
      {
        questionText: 'What is 1/3 + 1/6?',
        options: ['2/9', '1/2', '2/6', '1/3'],
        correctAnswerIndex: 1,
        explanation:
          'The LCD of 3 and 6 is 6. Rewrite 1/3 as 2/6. Then 2/6 + 1/6 = 3/6, which simplifies to 1/2.',
      },
      {
        questionText: 'Which fraction is equivalent to 2/3?',
        options: ['4/5', '6/9', '3/4', '4/8'],
        correctAnswerIndex: 1,
        explanation:
          'Multiplying both numerator and denominator of 2/3 by 3 gives 6/9. Both fractions represent the same amount.',
      },
      {
        questionText: 'If you eat 3 slices of a pizza that has 12 slices, what fraction of the pizza did you eat in simplest form?',
        options: ['3/12', '1/3', '1/4', '2/6'],
        correctAnswerIndex: 2,
        explanation:
          '3 out of 12 slices is 3/12. Dividing numerator and denominator by 3 gives 1/4.',
      },
    ],
  });

  const decimalsQuestionSet = await QuestionSet.create({
    lessonId: decimalsLesson._id,
    formatVersion: 1,
    questions: [
      {
        questionText: 'What is the place value of the digit 6 in the number 2.364?',
        options: ['Ones', 'Tenths', 'Hundredths', 'Thousandths'],
        correctAnswerIndex: 2,
        explanation:
          'In 2.364, the 3 is in the tenths place, the 6 is in the hundredths place, and the 4 is in the thousandths place.',
      },
      {
        questionText: 'Which decimal is equal to the fraction 3/4?',
        options: ['0.25', '0.34', '0.75', '0.50'],
        correctAnswerIndex: 2,
        explanation:
          'Divide 3 by 4 to get 0.75. Alternatively, 3/4 = 75/100 = 0.75.',
      },
      {
        questionText: 'Which is greater: 0.8 or 0.75?',
        options: [
          '0.75 is greater',
          '0.8 is greater',
          'They are equal',
          'Cannot be determined',
        ],
        correctAnswerIndex: 1,
        explanation:
          'Rewrite 0.8 as 0.80. Comparing 80 hundredths to 75 hundredths shows that 0.80 > 0.75.',
      },
      {
        questionText: 'What is 5.4 + 2.35?',
        options: ['7.39', '7.75', '7.85', '8.75'],
        correctAnswerIndex: 1,
        explanation:
          'Align the decimal points: 5.40 + 2.35 = 7.75. Estimating confirms — about 5 + 2 = 7, so 7.75 is reasonable.',
      },
      {
        questionText: 'How do you write 0.125 as a fraction in simplest form?',
        options: ['1/5', '1/8', '125/10', '1/4'],
        correctAnswerIndex: 1,
        explanation:
          '0.125 = 125/1000. Dividing numerator and denominator by 125 gives 1/8.',
      },
    ],
  });

  console.log(`Created question set for "${fractionsLesson.title}" (${fractionsQuestionSet.questions.length} questions)`);
  console.log(`Created question set for "${decimalsLesson.title}" (${decimalsQuestionSet.questions.length} questions)`);

  console.log('\nSeed completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
