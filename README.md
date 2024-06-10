## Meta U CodePath Assignment: Music Playlist Explorer

Submitted by: **Theo Halpern**

Estimated time spent: **30** hours spent in total

Deployed Application (optional): [Music Playlist Explorer Deployed Site](https://site-unit2-project1-music-playlis-git-beb954-dumax315s-projects.vercel.app/)

### Application Features

#### CORE FEATURES

-   [x] **Display Playlists**

    -   [x] Dynamically render playlists on the homepage using JavaScript.
    -   [x] Fetch data from a provided JSON file and use it to create interactive playlist tiles.
    -   [x] Each title should display the playlist's cover image, name, creator, and like count.

-   [x] **Playlist Details**

    -   [x] Create a modal view that displays detailed information about a playlist when a user clicks on a playlist tile.
    -   [x] The modal should show the playlist's cover image, name, creator, and a list of songs, including their titles, artists, and durations.

-   [x] **Like Playlists**

    -   [x] Implement functionality to allow users to like playlists by clicking a heart icon on each playlist tile.
    -   [x] Update the like count on the playlist tile when a playlist is liked or unliked.

-   [x] **Shuffle Songs**
    -   [x] Enable users to shuffle the songs within a playlist using a shuffle button in the playlist detail modal.
    -   [x] Rearrange the songs in the modal view when the shuffle button is clicked.

#### STRETCH FEATURES

-   [x] **Add New Playlists**

    -   [x] Allow users to create new playlists.
    -   [x] Users can input playlist name, creator, and add multiple songs with details like title, artist, and duration.

-   [x] **Edit Existing Playlists**

    -   [x] Enable users to modify the details of existing playlists.
    -   [x] Add an edit button to each playlist tile.
    -   [x] Users can update the name, creator, and songs of the playlist.

-   [x] **Delete Playlists**

    -   [x] Add a delete button to each playlist tile.
    -   [x] When clicked, the playlist is removed from the display and data model.

-   [x] **Search Functionality**

    -   [x] Implement a search bar that allows users to filter playlists by name or creator.

-   [x] **Sorting Options**
    -   [x] Implement a dropdown or button options that allow users to sort the playlist by name, number of likes, or date added.

### Walkthrough Video

// the vid from the repo


https://github.com/dumax315/site-unit2-project1-music-playlist-explorer-starter/assets/26506274/14b1268d-4bcf-499e-8f9b-fc4d52c0195f



// below are hosted versions of the vid (there is also a copy in the main dir)
https://www.loom.com/share/215364d88d3d4d60813747b9bd965263?sid=9946ebeb-4fdf-4848-87f7-1ab4a813f098

https://www.loom.com/embed/215364d88d3d4d60813747b9bd965263?sid=ec18a3e5-a5dd-406a-9d63-015cbf6a8155


### Reflections

-   Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?
  --I felt like the css concepts (espeically the lab topic about flexbox) were helpful in creating my website.

-   If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.
--I would have redesigned the website to use a more modern color scheme and would have removed the bg on the cards (also to be more modern)

-   Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?
--I felt like the code explanation part of my demo (where I showed how I implomented the search bar) went well. I want to spend more time on slide in the future to make sure I cover all bases.

### Open-source libraries used

-   Font Awesome
-   Supabase

### Shout out

Give a shout out to somebody from your cohort that especially helped you during your project. This can be a fellow peer, instructor, TA, mentor, etc.

## TASK tracker

| task                                                                     | time estimate                   | started             | finished               |
| ------------------------------------------------------------------------ | ------------------------------- | ------------------- | ---------------------- |
| comment all functions                                                    | 1->2 hours                      | started             | finished 4:30          |
| connect to firebase auth                                                 | 3 hours                         | started 1pm         | finished 339 pm        |
| imploment a unified color pallet                                         | 2 hour                          | 7:21 am 6/7         |                        |
| create a featured public playlist page                                   | 2 hours                         |                     | finsished 6/6          |
| --with add button                                                        | 1 hour                          |                     |                        |
| retrieve json firebase                                                   | 2.5 hours                       | started 4:39        | finished 6/6           |
| make a featured page                                                     |                                 |                     | finsihed afternoon 6/6 |
| **Add New Playlists**                                                    | 2 hours                         | started 8:21 am     | finished 11:27 6/6     |
| **Edit Existing Playlists**                                              | 2 hours                         |                     | 9:20 6/7               |
| --Enable users to modify the details of existing playlists.              |                                 |                     |                        |
| --Add an edit button to each playlist tile.                              |                                 |                     |                        |
| -- Users can update the name, creator, and songs of the playlist.        |                                 |                     |                        |
| add song                                                                 | 1 hour                          |                     | finsihed 12:51 6/6     |
| delete song                                                              | 1.5 hours                       |                     |                        |
| **Delete Playlists**                                                     | 45 min                          |                     | 9:45 am 6/7            |
| --Add a delete button to each playlist tile.                             |                                 |                     |                        |
| --When clicked, the playlist is removed from the display and data model. |                                 |                     |                        |
| **Search Functionality**                                                 | 2 hours                         |                     | 530pm 6/7              |
| **Sorting Options**                                                      | 2 hours                         | started 9:45 am 6/7 | 11:00 am 6/7           |
| sharing                                                                  | 45 min                          |                     |                        |
| song search for quick add                                                | 1.5 hours+ depending on the api |                     |                        |
| --spotify integration or the like                                        |                                 |                     |                        |
| set up CI with the github (try vercel first)                             |                                 |                     | finsihed, 6/6          |
| change text on the defualt button based on it's current function         | 20 min                          | started 11:40       | finished 11:50         |
| retool has local data is uploaded with respect to ids                    |                                 |                     | finished 11:40         |
| write a report/section on the privazy measures and implimacations        | 2 hours                         |                     |                        |
| refactor the code base into multiple files                               | 1.5 hours                       | started 3:55        | 50% complete 5 pm 6/7  |
| refactor the code base into multiple files  Part 2 (utils.js)            | 1.5 hours                       | started 3:55        | 50% complete 5 pm 6/7  |
| polish and integrate login and signup pages (maybe combine into one)     | 1.5 hours (to do it right)      |                     |                        |
| credit font awsome in the footer                                         | 10 min                          |                     |                        |
| lower the amount of rerender of the playlistlists                        | 45 min                          |                     |                        |
| fix open playlist modal heading                                          | 15 min (just css issues)        |                     |                        |
| more hover and active effects                                            | 40 min                          |                     |                        |
| make all the db stuff a class in a differnt js file                      | on going effort, see auth.js    |                     |                        |
| get hearted playlists first                                              | 40 min                          |                     |                        |
| fix the nav bar                                                          | 40 min                          |                     |                        |
| removed the repeated code in featured.js and script.js (DRY!)            | 1 hour                          |                     |                        |

-   \-\- means sub task
-   -> means I updated the estimate some time before starting the task
