import { useSimStore } from '../../../store/simStore'
import Projectile from './Projectile'
export default function Missiles() {
  const ids = useSimStore(s => s.missiles.map(m => m.id).join('|'))
  return ids ? ids.split('|').map(id => <Projectile key={id} id={id} collection="missiles" />) : null
}
