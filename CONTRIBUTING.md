# Contributing to SkillChain

Thank you for your interest in contributing to SkillChain! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager
- Git
- MetaMask or compatible Web3 wallet
- Basic knowledge of blockchain development

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SkillChain.git
   cd SkillChain
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/SkillChain-The-Reputation-System/SkillChain.git
   ```

4. **Install dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

5. **Set up environment variables** (see README.md for details)

## 🌿 Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch for integration
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

## 📝 Code Standards

### Smart Contracts (Solidity)

- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use OpenZeppelin standards where applicable
- Include comprehensive comments and documentation
- Write unit tests for all functionality
- Use descriptive variable and function names

**Example:**
```solidity
/**
 * @title UserDataManager
 * @dev Manages user profile data and reputation scores
 * @author SkillChain Team
 */
contract UserDataManager {
    /// @notice Maps user addresses to their profile data
    mapping(address => UserProfile) public userProfiles;
    
    /**
     * @notice Updates user profile information
     * @param _profileData The new profile data
     * @dev Emits ProfileUpdated event on success
     */
    function updateProfile(UserProfile memory _profileData) external {
        // Implementation
    }
}
```

### Frontend (TypeScript/React)

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Implement proper error boundaries
- Follow the established folder structure

**Example:**
```typescript
interface UserProfileProps {
  address: string;
  onUpdate: (profile: UserProfile) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  address, 
  onUpdate 
}) => {
  const { data: profile, isLoading } = useUserProfile(address);
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className="user-profile">
      {/* Component implementation */}
    </div>
  );
};
```

### Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(contracts): add reputation decay mechanism
fix(frontend): resolve wallet connection issue
docs(readme): update installation instructions
test(backend): add tests for JobManager contract
```

## 🧪 Testing Requirements

### Smart Contract Tests

All smart contracts must have comprehensive test coverage:

```bash
cd backend
npx hardhat test
```

**Test structure:**
```typescript
describe("UserDataManager", function () {
  let userDataManager: UserDataManager;
  let owner: Signer;
  let user: Signer;

  beforeEach(async function () {
    // Setup
  });

  describe("Profile Management", function () {
    it("Should allow users to update their profiles", async function () {
      // Test implementation
    });

    it("Should prevent unauthorized profile updates", async function () {
      // Test implementation
    });
  });
});
```

### Frontend Tests

Write unit tests for components and utilities:

```bash
cd frontend
npm test
```

**Test structure:**
```typescript
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('renders user information correctly', () => {
    render(<UserProfile address="0x123..." onUpdate={jest.fn()} />);
    expect(screen.getByText('User Profile')).toBeInTheDocument();
  });
});
```

## 📋 Pull Request Process

1. **Create a feature branch** from `develop`
2. **Make your changes** following code standards
3. **Add tests** for new functionality
4. **Update documentation** as needed
5. **Ensure all tests pass**:
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   ```

6. **Submit a pull request** to `develop` branch

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that causes existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior**
4. **Actual behavior**
5. **Environment details** (OS, browser, wallet, etc.)
6. **Screenshots** if applicable

## 💡 Feature Requests

For feature requests, please provide:

1. **Problem statement**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Alternatives considered**: Other approaches you've thought of
4. **Additional context**: Any other relevant information

## 🏷️ Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority:high`: High priority issues
- `smart-contracts`: Related to Solidity contracts
- `frontend`: Related to React/Next.js frontend

## 📚 Resources

### Learning Resources
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Web3 Development Guide](https://ethereum.org/en/developers/)

### Tools & References
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct
- Ask questions when unsure

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Discord**: Real-time community chat
- **Documentation**: Check our guides and API docs

Thank you for contributing to SkillChain! 🎉
