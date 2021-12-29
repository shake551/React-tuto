import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button className={"square " + (props.end ? 'end' : '')} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i, j) {
    let end = false;
    for (let k = 0; k < this.props.highlight?.length; k++) {
      if (JSON.stringify(this.props.highlight[k]) === JSON.stringify([i, j])) {
        end = true;
      }
    }
    return (
      <Square
        value={this.props.squares[i][j]}
        onClick={() => this.props.onClick(i, j)}
        end={end}
      />
    );
  }

  render() {
    return (
      <div>
        {
          Array(3).fill(0).map((ele, i) => {
            return (
              <div className="board-row">
                {
                  Array(3).fill(0).map((ele, j) => {
                    return (
                      <>
                      {this.renderSquare(i, j)}
                      </>
                    )
                  })
                }
              </div>
            )
          })
        }
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: [[null, null, null],
          [null, null, null],
          [null, null, null]]
      }],
      stepNumber: 0,
      xIsNext: true,
      toggle: props.toggle || false,
    };
  }

  handleClick(i, j) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    // shallow copy -> deep copy
    const squares = JSON.parse(JSON.stringify(current.squares));
    if (calculateWinner(squares) || squares[i][j]) {
      return;
    }
    squares[i][j] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleHandler() {
    this.setState({
      toggle: !this.state.toggle,
    });
    console.log(this.state.toggle);
  }

  endHandler(position) {
    this.setState({
      highlight: position,
    });
  }
  
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const res = calculateWinner(current.squares);
    const winner = res?.winner;
    const position = res?.position;

    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move :
        'Go to game start';
      if (move === this.state.stepNumber) {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}><strong>{desc}</strong></button>
          </li>
        );
      }
      else {
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      }
    });

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
      if (!this.state.highlight) {
        this.endHandler(position);
      }
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    let className = this.state.toggle ? "switch on" : "switch";
    if (this.state.toggle) {
      moves.reverse();
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i, j) => this.handleClick(i, j)}
            highlight={this.state.highlight}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div className={className} onClick={() => this.toggleHandler()}></div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [[0,0], [0,1], [0,2]],
    [[1,0], [1,1], [1,2]],
    [[2,0], [2,1], [2,2]],
    [[0,0], [1,0], [2,0]],
    [[0,1], [1,1], [2,1]],
    [[0,2], [1,2], [2,2]],
    [[0,0], [1,1], [2,2]],
    [[0,2], [1,1], [2,0]],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a[0]][a[1]] &&
      squares[a[0]][a[1]] === squares[b[0]][b[1]] &&
      squares[a[0]][a[1]] === squares[c[0]][c[1]]) {
      const res = {
        'winner': squares[a[0]][a[1]],
        'position': lines[i],
      }
      return res;
    }
  }
  return null;
}