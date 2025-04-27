import { collection, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

function ConsultForm() {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    birth: '',
    phone: '',
    refType: '',
    date: '',
    content: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1단계: 새 문서 추가
      const docRef = await addDoc(collection(db, 'consultations'), formData);

      // 2단계: 추가된 문서에 id 필드 업데이트
      await updateDoc(docRef, {
        id: docRef.id,
      });

      alert('상담 등록 완료!');
      setFormData({
        name: '',
        gender: '',
        birth: '',
        phone: '',
        refType: '',
        date: '',
        content: '',
      });
    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 입력 폼 구성 */}
      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="이름" />
      {/* 나머지 입력란들도 추가 */}
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">등록하기</button>
    </form>
  );
}

export default ConsultForm;
