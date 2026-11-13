# Part A: Product thinking

## 1. Questions I would ask

### The current state

I'd start by making sure we're on the same page about how things work today.

- Who uses the app, and what are their roles?
- What steps do users go through today to send content for human review?

### Why they want this

- Why do you need this feature?
- What went wrong in the current flow that made you think it needs changing?

### What counts as a response

- Does accept, dismiss or comment count as a response?
- If a user comments, does the comment also go through the AI review?

### Scope

- Does this apply to all users and all suggestions?
- Should anyone be able to bypass it?
- Are there cases where the AI makes no suggestions, or where a review isn't needed?

### Success and the audit trail

- How would we measure whether the feature worked?
- Are there numbers you already track that we could use to compare before and after?
- If comments go through the AI review, should we log them for later review?
- Who needs to see that log, and why? Reviewers, managers and compliance would each need something different.

## 2. How I would learn more without the customer

- **Similar features in other products**, not only competitors. GitHub can require every review comment to be resolved before a merge, and Grammarly and Google Docs both have accept and dismiss flows for suggestions.
- **Today's usage data.** How often reviewers send content back, and for what reasons. This shows whether skipped suggestions really cause extra review rounds.
- **Support and account managers.** What customers complain about in this flow, and whether other customers have asked for something similar.

## 3. Developer ready ticket

### Require responses to high-severity AI suggestions before submitting for review

**Background**

Users can send content for human review today without looking at the AI suggestions. A customer asked us to block submission until users respond to every suggestion. A blanket block would slow users down on minor suggestions, so this ticket blocks on high-severity suggestions only and warns about the rest.

**User story**

As a user sending content for review, I must respond to every high-severity AI suggestion before I can submit. Reviewers then don't spend a round on problems the AI already found.

**How it works**

1. Before a user submits, the AI reviews the content and makes suggestions, as it does today.
2. The user responds to each suggestion in one of two ways.
   - Accept it, which means fixing the content. The user edits the content in the product, or uploads a new version if it can't be edited there.
   - Dismiss it, with a short reason.
3. Every new version of the content gets a new AI review, and its suggestions need responses too.
4. The submit button stays disabled while any high-severity suggestion has no response. It shows how many are left.
5. If only lower-severity suggestions have no response, submitting shows a warning that lists them. The user can still continue.
6. The app logs every response with the user, the time, the suggestion, the action and the dismiss reason.

**Acceptance criteria**

- [ ] The submit button stays disabled while a high-severity suggestion has no response, and the button says how many are left.
- [ ] A user can dismiss a suggestion only after entering a reason.
- [ ] Uploading or saving a new version starts a new AI review, and its suggestions replace the old ones.
- [ ] Submitting with unanswered lower-severity suggestions shows a warning that lists them, and the user can continue.
- [ ] Content with no suggestions submits as it does today.
- [ ] Every accept and dismiss appears in the log with user, time, suggestion, action and reason.

**Out of scope**

- Letting anyone bypass the block.
- Screens for viewing the log. This ticket only stores it.
- Running the AI review on comments or dismiss reasons.

**Assumptions**

- The AI already gives each suggestion a severity, and "high" is a level we can check.
- A new version of the content triggers a new AI review.
- Nobody can bypass the block in this first version.

**Open questions**

These come from section 1 and can change the ticket once the customer is back.

- What counts as a response? This ticket assumes accept or dismiss with a reason.
- Should any role be able to bypass the block?
- Who needs the log, and for how long?
- Which numbers will tell us the feature worked? The candidate is how often reviewers send content back.

**Dependencies**

- The AI review service, for severity levels and for running a new review on each version.
- Storage for the response log.

**How we'll know it worked**

Compare how often reviewers send content back, and why, before and after release.
