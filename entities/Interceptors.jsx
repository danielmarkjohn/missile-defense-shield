import { useSimStore } from '../../../store/simStore'
import Projectile from './Projectile'
export default function Interceptors() {
  const ids = useSimStore(s => s.interceptors.map(m => m.id).join('|'))
  return ids ? ids.split('|').map(id => <Projectile key={id} id={id} collection="interceptors" />) : null
}
