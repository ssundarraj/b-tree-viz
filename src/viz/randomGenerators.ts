// Random data generators for demo purposes

const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Elijah', 'Elizabeth', 'Daniel', 'Sofia', 'Matthew', 'Avery',
  'Jackson', 'Ella', 'David', 'Scarlett', 'Carter', 'Grace', 'Jayden',
  'Chloe', 'Dylan', 'Victoria', 'Luke', 'Riley', 'Gabriel', 'Aria',
  'Anthony', 'Lily', 'Isaac', 'Zoey', 'Grayson', 'Penelope', 'Jack'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
  'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
  'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green',
  'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Turner'
];

/**
 * Generates a random number between min and max (inclusive)
 */
export function getRandomNumber(min: number = 1, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random full name
 */
export function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Generates a random ID that's likely to be unique in the current session
 * Uses a wider range to reduce collision probability
 */
export function getRandomId(): number {
  return getRandomNumber(1, 999);
}

/**
 * Generates a random number suitable for B-tree insertion
 * Uses a smaller range for better visualization
 */
export function getRandomBTreeValue(): number {
  return getRandomNumber(1, 100);
}