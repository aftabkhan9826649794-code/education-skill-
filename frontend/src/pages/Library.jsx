import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Library = () => {
  const navigate = useNavigate();
  const [activeBoard, setActiveBoard] = useState('all');

  // Mock book data
  const books = [
    { id: 1, title: 'Mathematics - Class 10', board: 'CBSE', subject: 'Math', cover: 'https://via.placeholder.com/200x280/1a1a2e/FFD700?text=Math+X' },
    { id: 2, title: 'Science - Class 10', board: 'CBSE', subject: 'Science', cover: 'https://via.placeholder.com/200x280/1a1a2e/00FF00?text=Science+X' },
    { id: 3, title: 'English - Class 10', board: 'ICSE', subject: 'English', cover: 'https://via.placeholder.com/200x280/1a1a2e/FF6B6B?text=English+X' },
    { id: 4, title: 'Physics - Class 12', board: 'NIOS', subject: 'Physics', cover: 'https://via.placeholder.com/200x280/1a1a2e/4ECDC4?text=Physics+XII' },
    { id: 5, title: 'History - Class 9', board: 'State', subject: 'History', cover: 'https://via.placeholder.com/200x280/1a1a2e/FFA500?text=History+IX' },
    { id: 6, title: 'Chemistry - Class 11', board: 'CBSE', subject: 'Chemistry', cover: 'https://via.placeholder.com/200x280/1a1a2e/9B59B6?text=Chemistry+XI' }
  ];

  const boards = ['all', 'CBSE', 'ICSE', 'NIOS', 'State'];
  
  const filteredBooks = activeBoard === 'all' 
    ? books 
    : books.filter(book => book.board === activeBoard);

  return (
    <div className="min-h-screen bg-midnight-black relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div className="absolute top-20 right-10 w-96 h-96 bg-royal-red/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gold/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="glass-strong rounded-2xl p-8 mb-8 border border-gold/20 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gradient">Global Library</span>
            </h1>
            <p className="text-white/90 text-lg">
              <i className="fas fa-book-open text-gold mr-2"></i>
              Access Educational Resources from Multiple Boards
            </p>
          </div>

          {/* Board Filters */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            {boards.map((board) => (
              <button
                key={board}
                onClick={() => setActiveBoard(board)}
                className={`px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                  activeBoard === board
                    ? 'bg-gradient-royal text-white glow-gold'
                    : 'glass text-gold border border-gold/30 hover:bg-gold/10'
                }`}
              >
                {board === 'all' ? 'All Books' : board}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="glass-strong rounded-xl overflow-hidden border border-gold/20 hover:glow-gold transition-all duration-300 group cursor-pointer"
              >
                {/* Book Cover */}
                <div className="relative overflow-hidden">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-80 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-royal px-3 py-1 rounded-full text-white text-xs font-bold">
                    {book.board}
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-gold transition-colors">
                    {book.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      <i className="fas fa-bookmark text-royal-red mr-1"></i>
                      {book.subject}
                    </span>
                    <button className="text-gold hover:text-white transition-colors">
                      <i className="fas fa-download"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <i className="fas fa-book-dead text-gray-600 text-6xl mb-4"></i>
              <p className="text-gray-400 text-lg">No books found for this board</p>
            </div>
          )}

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/')}
              className="glass px-8 py-4 rounded-full text-gold font-bold hover:glow-gold transition-all inline-flex items-center gap-2"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
