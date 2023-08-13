# DISMATH - DISCRETE MATH - DAMATH

Damath is a game which practices and tests the calculation skills of the players.  

Damath was invented by Jesus Huenda, a teacher from Sorsogon who aims to use board games to teach those dislike mathematics to learn the subject.   

Back in senior high school, I made derivative damath, a version of Damath that practices players in basic derivative rules for calculus. You can watch it below:

Originally, I was planning to implement it, but it would be complex to calculate since it involves derivatives, so I went and implemented my former professor version of Damath for Discrete Mathematics, Dismath.

## About  
This is a web implementation of the paper: https://ieeexplore.ieee.org/document/9072894 written by my former professor college professor Dr. Melvin Cabatuan.

You can find more of his work at:

* https://www.researchgate.net/profile/Melvin-Cabatuan
* https://github.com/melvincabatuan
* https://ieeexplore.ieee.org/author/38505771100   

His original game is written using pygame, and I implemented it using React. There might be bugs in the code due to time constraints, but it should be stable at the very least. The AI opponent is not as strong as stated in the paper, as my static evaluation function is the bare minimum. It does not search deep the tree of best case scenarios. Unfortunately, I cannot commit time to make it better due to the other ongoing bootcamp I am currently attending.

### How to play
https://docs.google.com/presentation/d/1BBRXjgx873v1G8OfKJB6SSgGYQb8MWoduC3B8BfSBYw/edit?usp=sharing

### Future Developments
* Smarter AI opponent. During the time of writing, I am currently attending a bootcamp, so  
 I can't commit more time to improve the algorithm for the mini-max algorithm.
* Better UX, currently there's a difficulty in dragging the pieces around
* Better state handling, there is a delay within updating of state, particularly between  
 the communication between the firebase and the program logic
* Better UI. I am no front-end expert, I am more of a back-end person, but hopefully I can  
 improve my front end skills.

### Known bugs
* Sometimes, when you do weird mouse movements, you can spawn another copy of a piece (FIX)
* (HARD TO REPLICATE) If you have multiple pieces that can capture, all of it can capture,
which is against the game rules theoretically, since you can only capture with one piece,
in which, after that selected piece ended its capture streak, the move will end. Admin note: As of
August 6, 2023 - This has been fixed.
* Sometimes, when you move and capture is detected, it will still be your move (FIXED)
* Minor page loading / rendering issues