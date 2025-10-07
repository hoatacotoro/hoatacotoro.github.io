---
title: programmer guide
layout: default
parent: 🎮 numberguessr
nav_order: 3
---

# programmer guide

## source code 

you can find the source code [here](https://github.com/hoatacotoro/numberguessr)
i will just do a small breakdown of source code. all the game is contained within main.py file, and i will try to comment as many things as possible. this code is so bad you just can not imagine how bad it is so here is part that starts the game itself
```python
while True:
    random_number = str(random.randint(1, 100))
    clear()
    #here is the score update
    if game.easy_score > current_score_easy:
        current_score_easy = game.easy_score
    if game.medium_score > current_score_medium:
        current_score_medium = game.medium_score
    if game.hard_score > current_score_hard:
        current_score_hard = game.hard_score
    #welcome screen
    print(
        f"Welcome to numbrguessr game. The game where you have to guess random selected number from 1 to 100!"
        f"\nChoose option: \n1 - Easy Mode     PR: {current_score_easy}\n2 - Medium Mode   PR: {current_score_medium}\n3 - Hard Mode     PR: {current_score_hard}")
    #input handling and yes i know theres just crazy amount of elif
    user_answer = input("-> ")
    if user_answer == "1":
        game.reset_score()
        clear()
        tries = 10
        print(f"You have {tries} tries")
        input("Press any key...")
        easy_mode(tries, user_attempts, game_round, random_number, high_score)
    elif user_answer == "2":
        game.reset_score()
        clear()
        tries = 6
        print(f"You have {tries} tries")
        input("Press any key...")
        medium_mode(tries, user_attempts, game_round, random_number, high_score)
    elif user_answer == "3":
        game.reset_score()
        clear()
        tries = 1
        print(f"You have {tries} tries")
        input("Press any key...")
        hard_mode(tries, user_attempts, game_round, random_number, high_score)
    elif user_answer == "gghh":
        game.add_score_easy()
    elif user_answer == "yuyu":
        game.add_score_medium()
    elif user_answer == "boom":
        game.add_score_hard()
    elif user_answer == "linas":
        game.reset_score()
    else:
        clear()
        print("Invalid option")
        input("Press any key...")
```

as you can see it takes like A LOT of lines just to handle user input

```python
def easy_mode(tries, user_attempts, game_round, random_number, high_score):
    clear()
    print(f"Current round {game_round}")
    print("Guess the number from 1 to 100")
    threading.Thread(target=hint, args=(), daemon=True).start()
    start = time.time()
    while tries > 0:
        user_answer = input("Your guess: ")
        if user_answer == random_number: # win
            end = time.time()
            elapsed_time = round(end - start, 2)
            print(f"You won! It took you {user_attempts} attempts and {elapsed_time} seconds!\nDo you want to continue playing?\n1 - Yes\n2 - No")
            random_number = str(random.randint(1, 100))
            game_round += 1 #so the next round will start
            game.add_score_easy()
            user_answer = input("Choose option: ")
            if user_answer == "1":
                clear()
                print(f"You have {tries} tries")
                input("Press any key...")
                easy_mode(tries, user_attempts, game_round, random_number, high_score)
                return high_score
            elif user_answer == "2":
                return high_score
            else: 
                print("Invalid option")
                input("Press any key...")
                return high_score
        elif user_answer > random_number:
            print(f"Your guess {user_answer} is HIGHER than selected number")
            input("Press any key...")
            tries -= 1
            user_attempts += 1
        elif user_answer < random_number:
            print(f"Your guess {user_answer} is LESS than selected number")
            input("Press any key...")
            tries -= 1
            user_attempts += 1
        else:
            print("Invalid option")
            input("Press any key...")
    print(f"You have no tries left! Selected number was {random_number}")
    input("Press any key...")
    return high_score
```

so this one is easy_mode part and the problem is that that code is duplicating 2 more times for medium and hard modes and its like really really bad but i was too lazy to fix all of those shitty code