### Smal bit of calculations
Nothing much here just a bit of math thats used to calculate the progress frpm the fields.

Following formula: 
const progress = (data.week.creditedSeconds / data.goalSeconds) * 100;

Example: 

The captured data contained everything needed to calculate progress.

Weekly goal: 36,000 seconds = 10 hours

Credited time: 34,911 seconds = 9 hours, 41 minutes, 51 seconds

Remaining time: 1,089 seconds = 18 minutes, 9 seconds

Result: 96.98%, approximately 97%.