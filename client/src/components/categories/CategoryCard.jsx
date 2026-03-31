import { Link } from 'react-router-dom';
import imageUrl from '../../../../admin/src/utils/baseUrl';

const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/products?category=${category._id}`}
      className="group text-center p-4 rounded-xl hover:shadow-lg transition-all duration-300 bg-white hover:bg-gray-50"
    >
      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover:scale-110 transition-transform">
        {category.image ? (
          <img src={imageUrl + category.image} alt={category.name} className="w-18 h-18  object-cover rounded-full" />
        ) : (
          <span className="text-2xl font-bold text-primary-600">{category.name.charAt(0)}</span>
        )}
      </div>
      <h3 className="font-medium text-gray-900 text-sm">{category.name}</h3>
    </Link>
  );
};

export default CategoryCard;
