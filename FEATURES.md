# Expense Tracker - User Authentication & Group Management

## New Features Added

### 1. **User Authentication System**
   - **Registration**: New users can create an account with name, email, and password
   - **Login**: Existing users can log in with email and password
   - **Secure Passwords**: All passwords are hashed using bcrypt before storage
   - **Session Management**: Uses HTTP-only cookies for secure session tracking

### 2. **Group Management**
   - **Create Groups**: Users can create new expense groups for different occasions
   - **Join Groups**: Users can join existing groups created by other users
   - **Leave Groups**: Users can leave groups at any time
   - **Group Members**: View all members in a group

### 3. **Group-Based Expenses**
   - Expense tracking is now group-specific
   - Each group has its own set of expenses and simplified balances
   - Members can only see and interact with their group's data

## How to Use

### Getting Started

1. **Register a New Account**
   - Navigate to `/register`
   - Enter your full name, email, and password
   - Click "Register" to create your account
   - You'll be automatically logged in and redirected to the home page

2. **Login to Existing Account**
   - Navigate to `/login`
   - Enter your email and password
   - Click "Login"
   - You'll be redirected to the home page

### Managing Groups

1. **Create a New Group**
   - On the home page, scroll to the "Create New Group" section
   - Enter a group name (e.g., "Trip to Goa", "Shared Apartment")
   - Click "Create" to create the group
   - You'll be automatically added as a member

2. **Join an Existing Group**
   - On the home page, click "Join Existing Group"
   - Select a group from the dropdown
   - Click "Join" to become a member

3. **View Your Groups**
   - All your groups are listed under "My Groups"
   - The first group is set as the active group by default
   - You can see the number of members in each group
   - Click "Leave" to remove yourself from a group

### Adding Expenses

1. Navigate to the active group
2. Fill in the expense form:
   - **Description**: What was the expense for?
   - **Total Amount**: The total expense amount
   - **Who Paid?**: Select who paid for the expense
   - **Split Method**: Choose how to split:
     - **Split Equally**: Divide equally among all members
     - **Exact Amounts**: Specify exact amount each person owes
     - **Percentage Split**: Distribute by percentage (must sum to 100%)

3. Fill in the split details for each member
4. Click "Add Expense" when the amounts are validated

### Viewing Balances

- Simplified balances are shown for your active group
- Shows who owes whom and how much
- When all debts are settled, displays "All balances settled! 🎉"

### Logging Out

- Click the "Logout" button in the top-right corner
- You'll be redirected to the login page

## Database Schema

### User Model
```
- id: Unique identifier
- name: User's full name
- email: User's unique email address
- password: Bcrypt-hashed password
- expenses: Expenses paid by this user
- splits: Expenses this user participated in
- groups: Group memberships
- createdGroups: Groups created by this user
- createdAt: Account creation timestamp
```

### Group Model
```
- id: Unique identifier
- name: Group name
- createdById: User who created the group
- members: List of group members
- expenses: Expenses in this group
- createdAt: Group creation timestamp
```

### GroupMember Model
```
- id: Unique identifier
- groupId: Reference to the group
- userId: Reference to the user
- createdAt: When user joined the group
- Constraint: unique(groupId, userId) - ensures a user can only be in a group once
```

### Expense Model
```
- id: Unique identifier
- description: What the expense was for
- amount: Total expense amount
- splitType: EQUAL, EXACT, or PERCENTAGE
- paidById: User who paid
- groupId: Group this expense belongs to
- splits: Individual user shares
- createdAt: When expense was recorded
```

### ExpenseSplit Model
```
- id: Unique identifier
- expenseId: Reference to the expense
- userId: Reference to the user
- amount: Amount this user owes
```

## File Structure

```
app/
  ├── auth-actions.ts          # Authentication actions (register, login, logout)
  ├── group-actions.ts         # Group management actions
  ├── actions.js               # Expense actions
  ├── page.tsx                 # Main dashboard (requires authentication)
  ├── login/
  │   └── page.tsx            # Login page
  ├── register/
  │   └── page.tsx            # Registration page
  └── ...

components/
  ├── GroupManager.tsx         # Group creation and joining UI
  ├── AddExpenseForm.js        # Expense form component
  ├── ResetButton.js           # Clear database button
  └── ...

lib/
  ├── auth.ts                  # Authentication utilities (hash, verify, cookies)
  ├── prisma.ts               # Prisma client
  └── balances.js             # Debt simplification logic

middleware.ts                  # Route protection middleware
```

## Security Features

1. **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
2. **HTTP-Only Cookies**: Session cookies are HTTP-only (not accessible from JavaScript)
3. **Secure Flag**: Cookies use secure flag in production
4. **SameSite Protection**: Cookies use 'lax' SameSite policy
5. **Session Expiry**: Sessions expire after 30 days
6. **Route Protection**: Middleware protects routes from unauthorized access

## Environment Variables

Make sure you have the following in your `.env` file:

```
DATABASE_URL=postgresql://...  # Your PostgreSQL database URL
NODE_ENV=production            # Set to 'production' for secure cookies
```

## Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Future Enhancements

- [ ] Edit existing expenses
- [ ] Delete expenses
- [ ] View expense history
- [ ] Export balances to CSV
- [ ] Payment settlement tracking
- [ ] Email reminders for outstanding debts
- [ ] Group invitation system with email
- [ ] Real-time notifications
- [ ] Mobile app version
