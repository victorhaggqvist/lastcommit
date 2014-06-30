/*jshint browser:true*/
/**
 * Widget that shows the last commit made in a users github repositories.
 *
 * Rewritten from https://github.com/johannilsson/lastcommit without jQuery
 *
 * By Victor Häggqvist (http://victorhaggqvist.com/)
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Victor Häggqvist
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function(){

  /**
   * Wrapper function for widget, gets latest commit for user
   *
   * @param  string   user     The user
   * @param  function callback Callback to be pased on to getCommitFromRepo
   */
  function getLastCommit(user, callback) {

    if (!user) { console.error('Did not find username on lastcommit widget'); return;}

    var r = new XMLHttpRequest();
    r.open('GET', 'https://api.github.com/users/' + user + '/repos', true);

    r.onreadystatechange = function () {
      if (r.readyState !== 4 || r.status !== 200) return;

      var respData = JSON.parse(r.responseText);
      respData.sort(function(a, b) {  // sort latest first
          return Date.parse(b.pushed_at) - Date.parse(a.pushed_at);
      });

      // console.log("Success: " + respData[0].pushed_at);
      getCommitFromRepo(user, respData[0], callback);
    };
    r.send();
  }

  /**
   * Gets the last commit by user in specityed repo
   *
   * @param  string   user     The user
   * @param  object   repo     Repository object as found in https://developer.github.com/v3/repos/#list-your-repositories
   * @param  function callback Function to called on successfull retrival of commit
   */
  function getCommitFromRepo(user, repo, callback) {
    // console.log(repo);
    var r = new XMLHttpRequest();
    r.open('GET', 'https://api.github.com/repos/' + user + '/' + repo.name + '/commits', true);

    r.onreadystatechange = function () {
      if (r.readyState !== 4 || r.status !== 200) return;

      var respData = JSON.parse(r.responseText);

      // filter only user commits
      var userCommits = respData.filter(function(a){
        if (a.committer.login === user) return true;
      });

      // console.log("Success: " + userCommits[0].commit.message);
      callback(repo, userCommits[0]);
    };
    r.send();
  }

  /**
   * Render widget.
   *
   * @param element The element to render the widget to.
   * @param data Data to populate the widget with.
   */
  function renderWidget(element, data) {
    var url = 'https://github.com/' + data.user + '/' + data.repo.name +'/commit/' + data.commit.sha,
        html = '<a href="' + url +'">' + data.commit.commit.message + '</a>';
    element.innerHTML = html;
  }

  var element = document.getElementsByClassName('lastcommit-widget')[0],
      user = element.getAttribute('data-user');

  getLastCommit(user, function (repo, commit) {
    renderWidget(element, {
        user: user,
        repo: repo,
        commit: commit
    });
  });

})();
